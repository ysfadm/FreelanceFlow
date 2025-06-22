# 🌍 FreelanceFlow — Web3 Freelance Payment & Escrow dApp on Stellar Testnet

**FreelanceFlow** is a Web3 dApp running on the Stellar testnet. It enables freelancers to securely receive payments from clients using fast and low-cost Stellar-based crypto (XLM or USDC). Payments are handled through a Soroban-based escrow smart contract and are released to freelancers upon approval.

---

## 🚀 Project Purpose

- Enable secure and trustless payments between clients and freelancers
- Leverage Stellar's fast and low-fee infrastructure
- Connect with Freighter wallet for a Web3-native UX
- Use Soroban smart contracts to implement an escrow mechanism

---

## 🧱 Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Frontend       | React + TypeScript + Tailwind CSS        |
| Wallet         | Freighter (browser-based Stellar wallet) |
| Smart Contract | Soroban (Rust-based)                     |
| Blockchain     | Stellar Testnet                          |
| SDKs           | Stellar SDK + Soroban SDK                |

---

## 📁 Project Structure

```
freelanceflow/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navigation and wallet connection
│   │   ├── JobForm.tsx         # Job creation form
│   │   └── JobList.tsx         # Display and manage jobs
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   └── Dashboard.tsx       # Main application interface
│   ├── utils/
│   │   └── stellar.ts          # Wallet & transaction helpers
│   ├── types/
│   │   ├── index.ts            # TypeScript interfaces
│   │   └── freighter.d.ts      # Freighter wallet types
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
├── contracts/
│   ├── escrow/
│   │   ├── src/lib.rs         # Soroban smart contract (Rust)
│   │   └── Cargo.toml         # Rust dependencies
│   ├── build.sh               # Contract build script
│   └── README.md              # Contract documentation
├── public/                     # Static assets
├── package.json               # Node.js dependencies
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

---

## ⚙️ Setup & Development

### Prerequisites

1. **Node.js & npm** (v18 or higher)
2. **Freighter Wallet** - Install from [https://freighter.app/](https://freighter.app/)
3. **Rust & Soroban CLI** (for smart contract development) - [Setup Guide](https://soroban.stellar.org/docs/getting-started/setup)

### 1. 🚧 Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/freelanceflow.git
cd freelanceflow

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

- Make sure Freighter wallet is installed and set to **Testnet** mode
- Get test XLM from the [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
- The app will ask you to connect your wallet on first load

### 2. 📦 Soroban Smart Contract Setup

```bash
# Navigate to contracts directory
cd contracts

# Make build script executable (Linux/Mac)
chmod +x build.sh

# Build the contract
./build.sh

# Deploy to testnet (requires Soroban CLI setup)
soroban contract deploy \
  --network testnet \
  --source <YOUR_IDENTITY> \
  --wasm target/wasm32-unknown-unknown/release/freelanceflow_escrow.wasm
```

For detailed contract setup instructions, see [`contracts/README.md`](contracts/README.md).

---

## 🔐 Smart Contract Functions

### Core Functions

- **`create_job(client, freelancer, amount, job_id)`** - Locks funds in escrow for a specific job
- **`approve_job(job_id)`** - Releases funds to freelancer upon client approval
- **`cancel_job(job_id)`** - Returns funds to client (if cancellation is allowed)
- **`get_job(job_id)`** - Retrieves job details
- **`get_user_jobs(user_address)`** - Gets all jobs for a specific user

### Job States

1. **Created** - Job is initialized
2. **InEscrow** - Funds are locked in smart contract
3. **Completed** - Work approved, funds released to freelancer
4. **Cancelled** - Job cancelled, funds returned to client

---

## 🔗 Freighter Wallet Integration

```typescript
import freighterApi from "@stellar/freighter-api";

const connectFreighter = async () => {
  try {
    // Check if already connected
    const isConnected = await freighterApi.isConnected();

    if (!isConnected) {
      // Request permission to connect
      await freighterApi.requestAccess();
    }

    const publicKey = await freighterApi.getPublicKey();
    const network = await freighterApi.getNetwork();

    if (network !== "TESTNET") {
      throw new Error("Please switch to Testnet mode");
    }

    console.log("Connected wallet:", publicKey);
    return { publicKey, network };
  } catch (error) {
    console.error("Freighter connection failed:", error);
    throw new Error("Freighter wallet not available or connection failed");
  }
};
```

---

## 🧪 Using the Stellar Testnet

1. **Install Freighter Wallet** - [Download here](https://freighter.app/)
2. **Get Test XLM** - Visit [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
3. **Switch to Testnet** - In Freighter settings, select "Testnet" network
4. **Connect & Use** - Connect wallet to FreelanceFlow and start creating jobs

---

## 🎯 How to Use FreelanceFlow

### For Clients:

1. **Connect Wallet** - Connect your Freighter wallet (Testnet mode)
2. **Create Job** - Fill out job form with freelancer's address and payment amount
3. **Lock Funds** - Approve transaction to lock payment in escrow
4. **Review Work** - Once freelancer delivers, review the work
5. **Release Payment** - Approve to release funds to freelancer

### For Freelancers:

1. **Receive Job** - Client creates job using your Stellar address
2. **Complete Work** - Deliver the work knowing payment is secured
3. **Get Paid** - Receive payment automatically when client approves

---

## 💡 Features

### ✅ Implemented

- [x] Freighter wallet integration
- [x] Job creation and management
- [x] Escrow smart contract (Soroban)
- [x] Payment approval and release
- [x] Job status tracking
- [x] Responsive UI with Tailwind CSS
- [x] TypeScript for type safety

### 🔄 In Progress

- [ ] Smart contract deployment automation
- [ ] Real-time job notifications
- [ ] Enhanced error handling

### 🚀 Future Enhancements

- [ ] NFT-based reputation system for freelancers
- [ ] DAO-powered job validation and arbitration
- [ ] AI-based freelancer matching engine
- [ ] Cross-chain payment integration (Celer, Axelar)
- [ ] USDC support alongside XLM
- [ ] Multi-signature approval for large payments
- [ ] Dispute resolution mechanism
- [ ] Time-based automatic releases

---

## 🛠️ Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Build smart contracts
cd contracts && ./build.sh
```

---


### 🌐 Live Demo

- **Stellar Network:** Testnet
- **Horizon Server:** https://horizon-testnet.stellar.org
- **Required:** Freighter Wallet Extension
- **Fund Account:** https://friendbot.stellar.org

### Post-Deployment Testing

1. ✅ Install [Freighter Wallet](https://freighter.app/)
2. ✅ Switch to **Testnet** network
3. ✅ Fund your account via [Friendbot](https://friendbot.stellar.org)
4. ✅ Test wallet connection and job creation

---

## 🧪 Testing

### Frontend Testing

```bash
# Run tests (when implemented)
npm test
```

### Smart Contract Testing

```bash
cd contracts/escrow
cargo test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_CONTRACT_ID=your_deployed_contract_id_here
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Freighter not detected**

   - Make sure Freighter extension is installed and enabled
   - Refresh the page after installing Freighter

2. **Wrong network**

   - Switch Freighter to "Testnet" mode in settings - Refresh the application

3. **Insufficient balance**

   - Get test XLM from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
   - Each account needs minimum 0.5 XLM to exist

4. **Transaction failures**

   - Check Stellar network status
   - Verify you have enough XLM for transaction fees
   - Ensure all addresses are valid Stellar addresses

5. **"Geçersiz cüzdan adresi alındı" (Invalid wallet address received)**

   This error occurs when Freighter returns invalid or empty public key data. Try these solutions:

   **Step 1: Basic Troubleshooting**

   - Close and reopen Freighter extension
   - Make sure Freighter is unlocked with your password
   - Ensure you have an active account selected
   - Refresh the browser page and try again

   **Step 2: Advanced Troubleshooting**

   - Disable and re-enable Freighter extension:
     1. Go to browser extension settings
     2. Disable Freighter
     3. Wait 10 seconds
     4. Re-enable Freighter
     5. Unlock with password
     6. Try connecting again

   **Step 3: Clear Browser Data**

   - Clear browser cache and cookies for the site
   - Hard refresh the page (Ctrl+F5)
   - Try in incognito/private browsing mode

   **Step 4: Network Issues**

   - Make sure Freighter is set to "Testnet"
   - Check if you have active accounts in Freighter
   - Try creating a new test account if current one is problematic

   **Step 5: Last Resort**

   - Completely uninstall and reinstall Freighter extension
   - Import your account again using seed phrase
   - Make sure to backup your seed phrase first!

6. **"Extension context invalidated" Error**

   This error occurs when the browser extension context becomes invalid, typically after:

   - Extension updates
   - Browser refreshes/reloads
   - Long periods of inactivity
   - Extension being disabled/re-enabled

   **Immediate Solutions:**

   - **Option 1: Page Reload** (Most Common Fix)
     1. Press F5 to refresh the page
     2. Try connecting to wallet again
   - **Option 2: Extension Reset**

     1. Right-click the Freighter extension icon
     2. Select "Remove from Chrome" or disable
     3. Wait 5 seconds
     4. Re-enable the extension
     5. Unlock Freighter and try again

   - **Option 3: Tab Management**

     1. Close the current tab
     2. Open FreelanceFlow in a new tab
     3. Connect wallet again

   - **Option 4: Browser Restart** (Last Resort)
     1. Close all browser windows
     2. Restart the browser
     3. Open FreelanceFlow again

   **Prevention Tips:**

   - Avoid keeping the dApp open for extended periods without activity
   - If you update Freighter, refresh all dApp pages
   - Consider bookmarking the dApp for easy access after browser restarts

   **Technical Details:**

   This error is caused by the browser's security model invalidating extension contexts. It's not specific to FreelanceFlow but affects all Web3 dApps that interact with browser extensions. The error is temporary and easily resolved with the solutions above.

7. **Console Debug Information**

   Open browser console (F12) to see detailed logs:

   - Look for 🔍 connection attempt logs
   - Check for ❌ error messages
   - Note the exact error details for troubleshooting
   - The app now provides 5 retry attempts with exponential backoff

---

## 📚 Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/docs)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## � Contract Deployment Status

### ✅ Live Smart Contract on Stellar Testnet

The FreelanceFlow Escrow contract has been successfully deployed and tested on Stellar Testnet:

- **Contract Address**: `CB4H5G5QP2V2LMGZWIS3D7JD2ZAPREW4RREQ2SOEIPMBWIQU6G754IA7`
- **Network**: Stellar Testnet
- **Deployment Date**: June 21, 2025
- **Status**: ✅ Active and Fully Tested

### 🔗 Explorer Links

- **Contract Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CB4H5G5QP2V2LMGZWIS3D7JD2ZAPREW4RREQ2SOEIPMBWIQU6G754IA7)
- **Deployment Transaction**: [View Transaction](https://stellar.expert/explorer/testnet/tx/811a5e8237f11991892feb4c7d1a7f0dda0b64653193e967f33cb59ecff4e99b)

### 🧪 Test Accounts

- **Admin/Client**: `GDNZWSMTJKO6MLQPHPPOHAPVDDW4UB535MVJOOIQJ7FOXGLLW55WPBDF` (Alice)
- **Freelancer**: `GDH7CJB3RDB3UCZ5CACFETJ2Z6OUI54LIWCWPIPC3DMI6MTOK5O3XNLH` (Bob)

### ✅ Verified Contract Functions

All smart contract functions have been tested and verified on testnet:

- ✅ `initialize` - Contract initialized with admin
- ✅ `create_job` - Job creation working perfectly
- ✅ `approve_job` - Job approval mechanism tested
- ✅ `cancel_job` - Job cancellation working
- ✅ `get_job` - Job retrieval functioning
- ✅ `get_user_jobs` - User job listing operational
- ✅ `get_admin` - Admin verification working
- ✅ `set_admin` - Admin management ready

### 🔌 Frontend Integration Ready

To integrate with your frontend, use these details:

```typescript
const CONTRACT_CONFIG = {
  contractId: "CB4H5G5QP2V2LMGZWIS3D7JD2ZAPREW4RREQ2SOEIPMBWIQU6G754IA7",
  network: "TESTNET",
  rpcUrl: "https://soroban-testnet.stellar.org:443",
  networkPassphrase: "Test SDF Network ; September 2015",
};
```

### 📊 Contract Build Info

- **WASM File Size**: 6,485 bytes (optimized)
- **WASM Hash**: `e26e79bf8fa0dea33ccc346616af79f4c66fb918985e0fdef0cdab165aabacfa`
- **Exported Functions**: 9 total
- **Test Coverage**: All 3 test cases passing ✅
- **Build Target**: `wasm32v1-none`

### 🎯 Ready for Production

The smart contract is now live and ready for:

- ✅ Frontend integration
- ✅ End-to-end testing
- ✅ User acceptance testing
- ✅ Production deployment

## 🚀 Live Demo

Watch how FreelanceFlow works in real time:

[🎥 Watch Demo Video](https://drive.google.com/file/d/1IpzaKae2yzcBeSRp38pH1eocaO36ei6E/view?usp=sharing)

---
## 📊 Pitch Deck

You can find more details about the project in the presentation below:

![Pitch Deck Preview](https://app.presentations.ai/view/zmF6QX) 

## �📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Stellar Development Foundation for the amazing blockchain infrastructure
- Freighter team for the excellent wallet
- Soroban team for smart contract capabilities
- Open source community for inspiration and tools

---

**Built with ❤️ for the Web3 freelancing community**
