#!/bin/bash

echo "🚀 Deploying Academic NFT Marketplace to Netlify..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ -d "out" ]; then
    echo "✅ Build successful! Static files generated in 'out' directory"
    echo "📁 Contents of out directory:"
    ls -la out/
else
    echo "❌ Build failed! 'out' directory not found"
    exit 1
fi

echo ""
echo "🎉 Ready for Netlify deployment!"
echo ""
echo "To deploy to Netlify:"
echo "1. Push this code to your GitHub repository"
echo "2. Connect your repository to Netlify"
echo "3. Set build settings:"
echo "   - Build command: cd frontend && npm install --legacy-peer-deps && npm run build"
echo "   - Publish directory: frontend/out"
echo "4. Deploy!"
echo ""
echo "Or use Netlify CLI:"
echo "npm install -g netlify-cli"
echo "netlify deploy --prod --dir=frontend/out" 