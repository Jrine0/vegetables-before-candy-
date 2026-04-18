#!/bin/bash

echo "🚀 Quick Netlify Deployment for Academic NFT Marketplace"
echo "========================================================"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the project
echo "🔨 Building project..."
cd frontend
npm install --legacy-peer-deps
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Build failed! 'out' directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=out

echo ""
echo "🎉 Deployment complete!"
echo "Your site should now be live on Netlify!" 