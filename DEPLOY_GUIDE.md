# FreelanceFlow - Stellar Testnet Deployment Guide

## 🌟 Deployment Options

### Option 1: Netlify (Recommended)

1. **Connect Repository:** Link your GitHub repository to Netlify
2. **Build Settings:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. **Deploy:** Automatic deployment on every push

### Option 2: Vercel

1. **Import Repository:** Connect your GitHub repo to Vercel
2. **Settings:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Deploy:** One-click deployment

### Option 3: GitHub Pages

1. **Enable Pages:** In repository settings
2. **Source:** GitHub Actions
3. **Workflow:** Use the provided workflow file

## 🚀 Current Configuration

✅ **Stellar Testnet Ready**

- Horizon Server: https://horizon-testnet.stellar.org
- Network: Test SDF Network ; September 2015
- Freighter Integration: Configured

## 📋 Pre-Deployment Checklist

- [ ] Build completes successfully (`npm run build`)
- [ ] All tests pass
- [ ] Freighter wallet integration working
- [ ] Testnet transactions functional

## 🧪 Testing Your Deployment

1. **Install Freighter:** https://freighter.app/
2. **Switch to Testnet:** In Freighter settings
3. **Fund Account:** https://friendbot.stellar.org
4. **Test Features:**
   - Wallet connection
   - Job creation
   - Transaction signing
