#!/bin/bash

# FreelanceFlow Deployment Script

echo "🚀 Building FreelanceFlow for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run build
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Files ready for deployment in 'dist' folder"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload 'dist' folder contents to your hosting provider"
    echo "2. Configure your domain to point to the uploaded files"
    echo "3. Test the application with Freighter wallet on Testnet"
    echo ""
    echo "🌐 Deployment options:"
    echo "- Netlify: Drag and drop 'dist' folder to deploy.netlify.com"
    echo "- Vercel: Connect GitHub repo and deploy automatically"
    echo "- GitHub Pages: Enable Pages in repository settings"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
