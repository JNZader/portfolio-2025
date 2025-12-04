#!/bin/bash
# Portfolio Cleanup Script
# Removes temporary files and optimizes the project

echo "🧹 Starting project cleanup..."

# Remove node_modules and reinstall
echo "📦 Cleaning node_modules..."
rm -rf node_modules
npm install

# Remove Next.js build artifacts
echo "🗑️ Removing build artifacts..."
rm -rf .next
rm -rf out

# Clean Next.js cache
echo "🧼 Cleaning Next.js cache..."
rm -rf .next/cache

# Remove log files
echo "🗑️ Removing log files..."
find . -name "*.log" -type f -delete 2>/dev/null
find . -name "npm-debug.log*" -type f -delete 2>/dev/null

# Remove OS-specific files
echo "🗑️ Removing OS-specific files..."
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null

# Run verifications
echo "✅ Running verifications..."
npm run type-check
npm run check

echo "✨ Cleanup completed!"
