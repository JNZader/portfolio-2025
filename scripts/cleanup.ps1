# Portfolio Cleanup Script
# Removes temporary files and optimizes the project

Write-Host "Starting project cleanup..." -ForegroundColor Cyan

# Remove node_modules and reinstall
Write-Host "Cleaning node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
npm install

# Remove Next.js build artifacts
Write-Host "Removing build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
}

# Clean Next.js cache
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next/cache") {
    Remove-Item -Recurse -Force ".next/cache"
}

# Remove log files
Write-Host "Removing log files..." -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*.log" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Filter "npm-debug.log*" | Remove-Item -Force -ErrorAction SilentlyContinue

# Remove OS-specific files
Write-Host "Removing OS-specific files..." -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter ".DS_Store" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Filter "Thumbs.db" | Remove-Item -Force -ErrorAction SilentlyContinue

# Run verifications
Write-Host "Running verifications..." -ForegroundColor Yellow
npm run type-check
npm run check

Write-Host "Cleanup completed!" -ForegroundColor Green
