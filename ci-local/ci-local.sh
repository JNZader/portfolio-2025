#!/bin/bash
# =============================================================================
# CI-LOCAL: run this repo's CI gates inside a clean Docker container
# =============================================================================
# Mirrors .github/workflows (install → prisma generate → biome check →
# type-check → tests → build) so you can catch failures BEFORE pushing and
# avoid burning GitHub Actions minutes.
#
# Usage:
#   ./ci-local/ci-local.sh            # full CI (all gates)
#   ./ci-local/ci-local.sh quick      # check + type-check only (fast)
#   ./ci-local/ci-local.sh shell      # interactive shell in the CI image
#   ./ci-local/ci-local.sh detect     # print the detected stack + commands
#
# Env:
#   CI_LOCAL_TIMEOUT   per-step timeout in seconds (default 900)
#
# Per-project config (optional, git-ignored):
#   ci-local/ci.env    dummy build-time env vars — copy from ci.env.example.
#                      Passed to the container via --env-file so `next build`
#                      doesn't fail on missing NEXT_PUBLIC_*/DATABASE_URL.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# shellcheck source=ci-local/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

# =============================================================================
# Per-stack CI command setup. The Node path mirrors .github/workflows exactly;
# the other stacks are sensible universal defaults for the rest of the ecosystem.
# =============================================================================
setup_ci_commands() {
    detect_stack "$PROJECT_DIR"

    DOCKERFILE=""
    INSTALL_CMD=""
    PREBUILD_CMD=""   # e.g. codegen that must run before compile/test
    LINT_CMD=""
    TYPECHECK_CMD=""
    COMPILE_CMD=""
    TEST_CMD=""

    case "$STACK_TYPE" in
        node)
            DOCKERFILE="node.Dockerfile"
            INSTALL_CMD="npm ci"
            # Prisma client must be generated before tsc/test/build see it.
            [[ -d "$PROJECT_DIR/prisma" ]] && PREBUILD_CMD="npx prisma generate"
            LINT_CMD="npm run check"          # biome check (lint + format)
            TYPECHECK_CMD="npm run type-check" # tsc --noEmit
            TEST_CMD="npm run test:run"        # vitest run (NOT bare vitest = watch)
            COMPILE_CMD="npm run build"        # prisma generate && next build
            ;;
        java-gradle)
            DOCKERFILE="java.Dockerfile"
            LINT_CMD="./gradlew spotlessCheck --no-daemon"
            COMPILE_CMD="./gradlew classes testClasses --no-daemon"
            TEST_CMD="./gradlew test --no-daemon"
            ;;
        java-maven)
            DOCKERFILE="java.Dockerfile"
            LINT_CMD="./mvnw spotless:check"
            COMPILE_CMD="./mvnw compile test-compile"
            TEST_CMD="./mvnw test"
            ;;
        python)
            DOCKERFILE="python.Dockerfile"
            LINT_CMD="ruff check ."
            TEST_CMD="pytest"
            ;;
        go)
            DOCKERFILE="go.Dockerfile"
            LINT_CMD="golangci-lint run"
            COMPILE_CMD="go build ./..."
            TEST_CMD="go test ./..."
            ;;
        rust)
            DOCKERFILE="rust.Dockerfile"
            LINT_CMD="cargo clippy -- -D warnings"
            COMPILE_CMD="cargo build"
            TEST_CMD="cargo test"
            ;;
    esac
}

# ghagga review is optional — only run it if the host has it installed.
GHAGGA_AVAILABLE=false
if command -v ghagga >/dev/null 2>&1; then
    GHAGGA_AVAILABLE=true
fi

# =============================================================================
# Docker
# =============================================================================
get_image_name() { echo "ci-local-$STACK_TYPE"; }

create_dockerfile() {
    local docker_dir="$SCRIPT_DIR/docker"
    mkdir -p "$docker_dir"

    case "$STACK_TYPE" in
        java-gradle|java-maven)
            cat > "$docker_dir/$DOCKERFILE" << 'DOCKERFILE'
ARG JAVA_VERSION=21
FROM eclipse-temurin:${JAVA_VERSION}-jdk-noble
RUN apt-get update && apt-get install -y git curl unzip && rm -rf /var/lib/apt/lists/*
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /home/runner/work
ENV GRADLE_USER_HOME=/home/runner/.gradle
ENTRYPOINT ["/bin/bash", "-c"]
DOCKERFILE
            ;;
        node)
            # node 22 matches .github/workflows; openssl is required by Prisma.
            # npm is upgraded to latest (as CI does) so the lockfile written by a
            # newer npm doesn't hit the npm-10-vs-lockfile-v3 EUSAGE mismatch.
            cat > "$docker_dir/$DOCKERFILE" << 'DOCKERFILE'
FROM node:22-slim
RUN apt-get update && apt-get install -y git openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g npm@latest
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /home/runner/work
ENTRYPOINT ["/bin/bash", "-c"]
DOCKERFILE
            ;;
        python)
            cat > "$docker_dir/$DOCKERFILE" << 'DOCKERFILE'
FROM python:3.12-slim
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir pytest ruff
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /home/runner/work
ENTRYPOINT ["/bin/bash", "-c"]
DOCKERFILE
            ;;
        go)
            cat > "$docker_dir/$DOCKERFILE" << 'DOCKERFILE'
FROM golang:1.23-bookworm
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.62.0 && \
    mv /root/go/bin/golangci-lint /usr/local/bin/
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /home/runner/work
ENTRYPOINT ["/bin/bash", "-c"]
DOCKERFILE
            ;;
        rust)
            cat > "$docker_dir/$DOCKERFILE" << 'DOCKERFILE'
FROM rust:1.83-slim
RUN apt-get update && apt-get install -y git pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
RUN rustup component add clippy rustfmt
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /home/runner/work
ENTRYPOINT ["/bin/bash", "-c"]
DOCKERFILE
            ;;
    esac

    echo -e "${GREEN}Created $DOCKERFILE${NC}"
}

ensure_docker_image() {
    local image_name dockerfile current_hash image_hash
    image_name=$(get_image_name)
    dockerfile="$SCRIPT_DIR/docker/$DOCKERFILE"

    if [[ ! -f "$dockerfile" ]]; then
        echo -e "${YELLOW}Creating Dockerfile for $STACK_TYPE...${NC}"
        create_dockerfile
    fi

    # Rebuild only when the Dockerfile content changed since the last build.
    current_hash=$(sha256sum "$dockerfile" 2>/dev/null | cut -d' ' -f1)
    image_hash=$(docker inspect --format='{{index .Config.Labels "dockerfile-hash"}}' "$image_name" 2>/dev/null || echo "")

    if [[ "$current_hash" != "$image_hash" ]]; then
        echo -e "${YELLOW}Building CI Docker image...${NC}"
        local -a build_args=("--label" "dockerfile-hash=$current_hash")
        if [[ -n "$JAVA_VERSION" && "$STACK_TYPE" == java-* ]]; then
            build_args+=("--build-arg" "JAVA_VERSION=$JAVA_VERSION")
        fi
        docker build "${build_args[@]}" -f "$dockerfile" -t "$image_name" "$SCRIPT_DIR/docker"
    fi
}

run_in_ci() {
    local image_name timeout
    image_name=$(get_image_name)
    local -a docker_flags=(--rm)
    [ -t 0 ] && docker_flags+=(-it)

    # Optional per-project env file (dummy build vars). git-ignored.
    if [[ -f "$SCRIPT_DIR/ci.env" ]]; then
        docker_flags+=(--env-file "$SCRIPT_DIR/ci.env")
    fi

    timeout="${CI_LOCAL_TIMEOUT:-900}"
    if ! [[ "$timeout" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}Error: CI_LOCAL_TIMEOUT must be a positive integer, got: $timeout${NC}"
        exit 1
    fi

    # Run as the host user so the bind-mounted working tree (node_modules,
    # .next, coverage) stays writable and isn't left root-owned. HOME/npm cache
    # point at /tmp because this uid isn't in the image's /etc/passwd.
    # --entrypoint timeout: the image's default entrypoint is `bash -c`, which
    # would swallow `timeout` as its script arg. Overriding lets docker build a
    # clean argv: timeout <secs> bash -c "<cmd>".
    docker run "${docker_flags[@]}" \
        --stop-timeout 30 \
        --entrypoint timeout \
        --user "$(id -u):$(id -g)" \
        -e HOME=/tmp \
        -e npm_config_cache=/tmp/.npm \
        -v "$PROJECT_DIR:/home/runner/work" \
        -e CI=true \
        "$image_name" "$timeout" bash -c "$1"
}

# Run a named gate inside the container, chaining install/prebuild first so the
# node_modules + generated clients exist. Skips silently if the command is empty.
run_gate() {
    local title="$1" cmd="$2"
    [[ -z "$cmd" ]] && return 0
    echo -e "\n${YELLOW}$title${NC}"
    echo -e "  ${CYAN}$cmd${NC}"
    local full="cd /home/runner/work"
    [[ -n "$INSTALL_CMD" ]] && full="$full && $INSTALL_CMD"
    [[ -n "$PREBUILD_CMD" ]] && full="$full && $PREBUILD_CMD"
    full="$full && $cmd"
    run_in_ci "$full"
}

# =============================================================================
# Main
# =============================================================================
echo -e "\n${YELLOW}=== CI-LOCAL ===${NC}"

setup_ci_commands

if [[ "$STACK_TYPE" == "unknown" ]]; then
    echo -e "${RED}Could not detect project type!${NC}"
    echo -e "${YELLOW}Supported: Java/Gradle, Java/Maven, Node, Python, Go, Rust${NC}"
    exit 1
fi

echo -e "${GREEN}Detected: $STACK_TYPE ($BUILD_TOOL)${NC}"
[[ "$STACK_TYPE" == java-* ]] && echo -e "${GREEN}Java version: $JAVA_VERSION${NC}"

MODE="${1:-full}"

case "$MODE" in
    detect)
        echo -e "\n${CYAN}Stack details:${NC}"
        echo "  Type:      $STACK_TYPE"
        echo "  Build:     $BUILD_TOOL"
        echo "  Install:   $INSTALL_CMD"
        echo "  Prebuild:  $PREBUILD_CMD"
        echo "  Lint:      $LINT_CMD"
        echo "  Typecheck: $TYPECHECK_CMD"
        echo "  Test:      $TEST_CMD"
        echo "  Compile:   $COMPILE_CMD"
        [[ -f "$SCRIPT_DIR/ci.env" ]] && echo "  Env file:  ci-local/ci.env (present)"
        exit 0
        ;;

    quick)
        ensure_docker_image
        echo -e "\n${YELLOW}Running quick check (lint + type-check)...${NC}"
        run_gate "Lint" "$LINT_CMD"
        run_gate "Type check" "$TYPECHECK_CMD"
        ;;

    shell)
        ensure_docker_image
        echo -e "\n${YELLOW}Opening shell in CI environment...${NC}"
        image_name=$(get_image_name)
        docker run --rm -it \
            -v "$PROJECT_DIR:/home/runner/work" \
            -e CI=true \
            "$image_name" "cd /home/runner/work && bash"
        ;;

    full|*)
        ensure_docker_image
        echo -e "\n${YELLOW}Running full CI simulation...${NC}"
        run_gate "Lint" "$LINT_CMD"
        run_gate "Type check" "$TYPECHECK_CMD"
        run_gate "Test" "$TEST_CMD"
        run_gate "Compile / Build" "$COMPILE_CMD"

        if $GHAGGA_AVAILABLE; then
            echo -e "\n${YELLOW}ghagga review${NC}"
            echo -e "  ${CYAN}ghagga review --plain --exit-on-issues${NC}"
            if ! ghagga review --plain --exit-on-issues; then
                echo -e "${RED}ghagga review found issues!${NC}"
                exit 1
            fi
        fi
        ;;
esac

echo -e "\n${GREEN}CI Local completed successfully!${NC}"
echo -e "${GREEN}  Safe to push — CI should pass.${NC}\n"
