#!/bin/bash

echo "🔧 Setting up Hedera contract deployment..."

# Step 1: Copy Hedera contracts to src folder
echo "📁 Copying Hedera contracts to src/hedera..."
mkdir -p src/hedera
cp hedera/*.sol src/hedera/

# Step 2: Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Step 3: Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile

# Step 4: Deploy contracts
echo "🚀 Deploying contracts to Hedera..."
node hedera/deploy.js

echo "✅ Done!"
