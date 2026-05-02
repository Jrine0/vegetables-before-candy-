# 🚀 Netlify Deployment Guide

This guide will help you deploy vegetables-before-candy to Netlify.

## 📋 Prerequisites

- A GitHub account
- A Netlify account
- Your project code pushed to a GitHub repository

## 🔧 Project Configuration

The project is already configured for Netlify deployment with:

- ✅ `netlify.toml` configuration file
- ✅ Next.js static export configuration
- ✅ PWA (Progressive Web App) setup
- ✅ Build scripts configured

## 🚀 Deployment Steps

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Choose your repository

3. **Configure Build Settings**
   - **Build command**: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - **Publish directory**: `frontend/out`
   - **Node version**: `18` (already set in netlify.toml)

4. **Environment Variables** (Optional)
   Add these in Netlify dashboard if needed:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build the project**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod --dir=out
   ```

### Method 3: Manual Upload

1. **Build locally**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run build
   ```

2. **Upload to Netlify**
   - Go to Netlify dashboard
   - Drag and drop the `frontend/out` folder
   - Your site will be deployed instantly

## 🔧 Build Configuration

The project uses the following configuration:

### netlify.toml
```toml
[build]
  base = "."
  publish = "frontend/out"
  command = "cd frontend && npm install --legacy-peer-deps && npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### next.config.js
```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build fails with dependency conflicts**
   - Solution: Use `--legacy-peer-deps` flag (already configured)

2. **Images not loading**
   - Solution: Images are configured as `unoptimized: true` for static export

3. **API calls failing**
   - Solution: Update `NEXT_PUBLIC_API_URL` environment variable in Netlify

4. **PWA not working**
   - Solution: PWA is already configured with `next-pwa`

### Build Logs

If deployment fails, check the build logs in Netlify dashboard for specific error messages.

## 🎯 Features Included

- ✅ Static site generation
- ✅ PWA (Progressive Web App) support
- ✅ Service Worker for offline functionality
- ✅ Responsive design
- ✅ SEO optimized
- ✅ Security headers
- ✅ SPA routing with redirects

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 📞 Support

If you encounter any issues:

1. Check the build logs in Netlify dashboard
2. Verify all environment variables are set correctly
3. Ensure your backend API is accessible from Netlify's servers
4. Test the build locally before deploying

---

**Happy Deploying! 🎉** 