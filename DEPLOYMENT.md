# 🚀 FreelanceFlow Deployment Guide

This guide will help you deploy FreelanceFlow to production environments.

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Freighter wallet configured for target network
- [ ] Stellar testnet/mainnet account with sufficient XLM
- [ ] Soroban CLI installed for smart contract deployment

## 🏗️ Build Process

### 1. Environment Configuration

Create production environment file:

```bash
# .env.production
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_CONTRACT_ID=your_deployed_contract_id_here
```

### 2. Frontend Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview
```

### 3. Smart Contract Deployment

```bash
# Navigate to contracts directory
cd contracts

# Build contract
./build.sh

# Deploy to testnet
soroban contract deploy \
  --source your-identity \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/freelanceflow_escrow.wasm

# Initialize contract (replace CONTRACT_ID with actual deployed contract ID)
soroban contract invoke \
  --source your-identity \
  --network testnet \
  --id CONTRACT_ID \
  -- initialize \
  --admin YOUR_ADMIN_ADDRESS
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

2. **Environment Variables**

   - Add environment variables in Vercel dashboard
   - Ensure `VITE_` prefix for client-side variables

3. **Build Settings**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Option 2: Netlify

1. **Deploy via Git**

   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment Variables**
   - Set in Netlify dashboard under Site settings → Environment variables

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

### Option 4: Traditional VPS/Server

```bash
# On your server
git clone https://github.com/your-username/freelanceflow.git
cd freelanceflow

# Install dependencies
npm install

# Build
npm run build

# Serve with nginx/apache or use serve
npm install -g serve
serve -s dist -l 3000
```

## 🔧 Configuration

### Nginx Configuration (if using VPS)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/freelanceflow/dist;
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/freelanceflow/dist

    <Directory /path/to/freelanceflow/dist>
        AllowOverride All
        Require all granted
    </Directory>

    # Enable mod_rewrite for SPA routing
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</VirtualHost>
```

## 🔐 Security Considerations

### Frontend Security

1. **Environment Variables**

   - Never commit sensitive keys to version control
   - Use `VITE_` prefix only for public variables
   - Private keys should never be in frontend code

2. **Content Security Policy**

   ```html
   <meta
     http-equiv="Content-Security-Policy"
     content="default-src 'self'; 
                  script-src 'self' 'unsafe-inline'; 
                  style-src 'self' 'unsafe-inline';
                  connect-src 'self' https://horizon-testnet.stellar.org https://horizon.stellar.org;"
   />
   ```

3. **HTTPS**
   - Always use HTTPS in production
   - Freighter wallet requires HTTPS for security

### Smart Contract Security

1. **Code Audit**

   - Review contract code thoroughly
   - Test all edge cases
   - Consider professional audit for mainnet

2. **Access Control**
   - Verify admin functions are properly protected
   - Test authorization mechanisms
   - Implement proper error handling

## 📊 Monitoring & Analytics

### Error Tracking

```bash
# Install Sentry for error tracking
npm install @sentry/react

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

### Analytics

```bash
# Install analytics
npm install @vercel/analytics

# Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app */}
      <Analytics />
    </>
  );
}
```

## 🧪 Testing Production Build

### Local Testing

```bash
# Build and serve locally
npm run build
npx serve dist

# Test with lighthouse
npx lighthouse http://localhost:3000
```

### Testnet Verification

1. **Wallet Connection**

   - Verify Freighter connects properly
   - Test on different browsers
   - Check mobile compatibility

2. **Transaction Testing**

   - Create test jobs
   - Verify escrow functionality
   - Test approval process

3. **Error Handling**
   - Test network failures
   - Verify error messages
   - Check fallback states

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Working**

   - Ensure `VITE_` prefix for client-side variables
   - Restart development server after changes
   - Check for typos in variable names

3. **Wallet Connection Issues**

   - Verify HTTPS in production
   - Check Content Security Policy
   - Ensure Freighter is installed and configured

4. **Smart Contract Deployment Failures**

   ```bash
   # Check Soroban CLI version
   soroban --version

   # Verify network configuration
   soroban config network ls

   # Check account balance
   soroban config identity address YOUR_IDENTITY
   ```

## 📈 Performance Optimization

### Bundle Size Optimization

```bash
# Analyze bundle size
npm run build
npx bundlemon

# Optimize imports
# Use tree-shaking friendly imports
import { Server } from '@stellar/stellar-sdk';
```

### Caching Strategy

```nginx
# Nginx caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_STELLAR_NETWORK: ${{ secrets.VITE_STELLAR_NETWORK }}
          VITE_CONTRACT_ID: ${{ secrets.VITE_CONTRACT_ID }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

---

**Need help with deployment? Check our [troubleshooting guide](README.md#troubleshooting) or open an issue!**
