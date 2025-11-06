#!/bin/sh
set -e

echo "=== Docker Entrypoint Script ==="

# Check if node_modules exists and has content
# Note: node_modules is a volume mount, so we check if it's empty
if [ ! -d "node_modules" ]; then
    echo "node_modules directory missing. Installing all dependencies..."
    npm install --legacy-peer-deps --force
elif [ ! "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "node_modules is empty. Installing all dependencies..."
    npm install --legacy-peer-deps --force
else
    echo "node_modules exists with content. Checking dependencies..."
fi

echo "Checking for Rollup Linux binary..."

# Check if rollup binary exists
if [ ! -d "node_modules/@rollup/rollup-linux-x64-gnu" ]; then
    echo "Rollup Linux binary not found. Attempting to install..."
    
    # Try to install rollup binary directly first (faster)
    echo "Installing @rollup/rollup-linux-x64-gnu directly..."
    npm install --save-optional @rollup/rollup-linux-x64-gnu --legacy-peer-deps --force || true
    
    # If still not found, install all dependencies (without removing node_modules)
    if [ ! -d "node_modules/@rollup/rollup-linux-x64-gnu" ]; then
        echo "Direct install failed. Reinstalling all dependencies..."
        npm install --legacy-peer-deps --force
        
        # Verify again
        if [ ! -d "node_modules/@rollup/rollup-linux-x64-gnu" ]; then
            echo "WARNING: @rollup/rollup-linux-x64-gnu still not found after full install"
            echo "Attempting explicit install one more time..."
            npm install @rollup/rollup-linux-x64-gnu --legacy-peer-deps --force --no-save || true
        fi
    fi
else
    echo "Rollup Linux binary found."
fi

# Rebuild native modules to ensure they're correct for this platform
echo "Rebuilding native modules..."
npm rebuild || echo "Rebuild completed with warnings (this is usually OK)"

# Final check
if [ ! -d "node_modules/@rollup/rollup-linux-x64-gnu" ]; then
    echo "WARNING: @rollup/rollup-linux-x64-gnu is still missing!"
    echo "Listing @rollup packages:"
    ls -la node_modules/@rollup/ 2>/dev/null || echo "No @rollup directory found"
    echo "Attempting to continue anyway..."
else
    echo "✓ Rollup Linux binary verified successfully"
fi

echo "Starting Vite dev server..."
exec npm run dev -- --host 0.0.0.0 --port 5173

