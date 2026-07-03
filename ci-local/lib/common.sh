#!/bin/bash
# =============================================================================
# ci-local/lib/common.sh - Shared helpers for the local CI simulator
# =============================================================================
# Source: source "$(dirname "$0")/lib/common.sh"
#
# Provides: color vars, log_* helpers, detect_stack.
# Kept intentionally small — this is the only consumer (ci-local.sh).
# =============================================================================

# Guard against double-sourcing
if [[ -n "${_COMMON_SH_LOADED:-}" ]]; then
    # shellcheck disable=SC2317  # reached when this file is sourced twice
    return 0 2>/dev/null || true
fi
_COMMON_SH_LOADED=1

# =============================================================================
# Colors
# =============================================================================
# shellcheck disable=SC2034
RED='\033[0;31m'
# shellcheck disable=SC2034
GREEN='\033[0;32m'
# shellcheck disable=SC2034
YELLOW='\033[1;33m'
# shellcheck disable=SC2034
CYAN='\033[0;36m'
# shellcheck disable=SC2034
NC='\033[0m'

# =============================================================================
# Logging helpers
# =============================================================================
log_ok()   { echo -e "  ${GREEN}[OK]${NC}   $1"; }
log_warn() { echo -e "  ${YELLOW}[WARN]${NC} $1"; }
log_fail() { echo -e "  ${RED}[FAIL]${NC} $1"; }
log_info() { echo -e "  ${CYAN}[INFO]${NC} $1"; }

# =============================================================================
# detect_stack - Auto-detect project technology stack
# =============================================================================
# Sets: STACK_TYPE, BUILD_TOOL, JAVA_VERSION
# Detects: java-gradle, java-maven, node, python, go, rust
# =============================================================================
# shellcheck disable=SC2034  # STACK_TYPE, BUILD_TOOL, JAVA_VERSION used by callers
detect_stack() {
    local project_dir="${1:-.}"

    STACK_TYPE="unknown"
    BUILD_TOOL=""
    JAVA_VERSION="21"

    # Java + Gradle
    if [[ -f "$project_dir/build.gradle" || -f "$project_dir/build.gradle.kts" ]]; then
        STACK_TYPE="java-gradle"
        BUILD_TOOL="gradle"
        if [[ -f "$project_dir/build.gradle.kts" ]]; then
            JAVA_VERSION=$(grep -E 'languageVersion\s*=\s*JavaLanguageVersion\.of\(' "$project_dir/build.gradle.kts" 2>/dev/null | grep -o '[0-9]\+' | head -1 || echo "21")
        elif [[ -f "$project_dir/build.gradle" ]]; then
            JAVA_VERSION=$(grep -E 'sourceCompatibility\s*=' "$project_dir/build.gradle" 2>/dev/null | grep -o '[0-9]\+' | head -1 || echo "21")
        fi
        [[ -z "$JAVA_VERSION" ]] && JAVA_VERSION="21"
        return
    fi

    # Java + Maven
    if [[ -f "$project_dir/pom.xml" ]]; then
        STACK_TYPE="java-maven"
        BUILD_TOOL="maven"
        return
    fi

    # Node.js
    if [[ -f "$project_dir/package.json" ]]; then
        STACK_TYPE="node"
        if [[ -f "$project_dir/pnpm-lock.yaml" ]]; then
            BUILD_TOOL="pnpm"
        elif [[ -f "$project_dir/yarn.lock" ]]; then
            BUILD_TOOL="yarn"
        else
            BUILD_TOOL="npm"
        fi
        return
    fi

    # Python (detection order: uv > poetry > pipenv > pip)
    if [[ -f "$project_dir/pyproject.toml" || -f "$project_dir/setup.py" || -f "$project_dir/requirements.txt" ]]; then
        STACK_TYPE="python"
        if [[ -f "$project_dir/uv.lock" ]]; then
            BUILD_TOOL="uv"
        elif [[ -f "$project_dir/poetry.lock" ]]; then
            BUILD_TOOL="poetry"
        elif [[ -f "$project_dir/Pipfile" ]]; then
            BUILD_TOOL="pipenv"
        else
            BUILD_TOOL="pip"
        fi
        return
    fi

    # Go
    if [[ -f "$project_dir/go.mod" ]]; then
        STACK_TYPE="go"
        BUILD_TOOL="go"
        return
    fi

    # Rust
    if [[ -f "$project_dir/Cargo.toml" ]]; then
        STACK_TYPE="rust"
        BUILD_TOOL="cargo"
        return
    fi
}
