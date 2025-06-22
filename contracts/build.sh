#!/bin/bash

# FreelanceFlow Escrow Contract Build and Deploy Script

echo "🚀 Building FreelanceFlow Escrow Contract..."

# Build the contract
cd contracts/escrow
soroban contract build

if [ $? -eq 0 ]; then
    echo "✅ Contract built successfully!"
    echo "📄 WASM file: target/wasm32-unknown-unknown/release/freelanceflow_escrow.wasm"
else
    echo "❌ Contract build failed!"
    exit 1
fi

# Deploy to testnet (uncomment when ready to deploy)
# echo "🌐 Deploying to Stellar Testnet..."
# 
# soroban contract deploy \
#   --wasm target/wasm32-unknown-unknown/release/freelanceflow_escrow.wasm \
#   --source <YOUR_SECRET_KEY> \
#   --network testnet
#
# if [ $? -eq 0 ]; then
#     echo "✅ Contract deployed successfully!"
# else
#     echo "❌ Contract deployment failed!"
#     exit 1
# fi

echo "🎉 Done! Contract is ready for deployment."
echo ""
echo "📝 To deploy manually:"
echo "   1. Make sure you have Soroban CLI installed"
echo "   2. Configure your testnet identity: soroban keys generate --global <identity>"
echo "   3. Fund your account with testnet XLM"
echo "   4. Deploy: soroban contract deploy --source <identity> --network testnet --wasm target/wasm32-unknown-unknown/release/freelanceflow_escrow.wasm"
