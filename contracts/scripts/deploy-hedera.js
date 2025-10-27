const {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractFunctionParameters,
  Hbar,
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Hedera client setup
function getHederaClient() {
  const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  const network = process.env.HEDERA_NETWORK || 'testnet';

  let client;
  if (network === 'mainnet') {
    client = Client.forMainnet();
  } else {
    client = Client.forTestnet();
  }

  client.setOperator(accountId, privateKey);
  return client;
}

async function deployContract(client, contractName, bytecode, gas = 4000000) {
  console.log(`\n📦 Deploying ${contractName}...`);

  try {
    const contractCreate = new ContractCreateFlow()
      .setGas(gas)
      .setBytecode(bytecode);

    const txResponse = await contractCreate.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const contractId = receipt.contractId;

    console.log(`✅ ${contractName} deployed!`);
    console.log(`   Contract ID: ${contractId.toString()}`);

    return contractId.toString();
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting RealmOS Smart Contract Deployment to Hedera\n');
  console.log('═══════════════════════════════════════════════════════');

  const client = getHederaClient();
  const network = process.env.HEDERA_NETWORK || 'testnet';
  
  console.log(`📍 Network: ${network}`);
  console.log(`👤 Operator: ${process.env.HEDERA_ACCOUNT_ID}`);
  console.log('═══════════════════════════════════════════════════════\n');

  const deploymentInfo = {
    network,
    timestamp: new Date().toISOString(),
    contracts: {},
  };

  try {
    // Read compiled contract bytecode
    const artifactsPath = path.join(__dirname, '../artifacts/src');

    // Deploy NFTMarketplace
    const marketplacePath = path.join(artifactsPath, 'NFTMarketplace.sol/NFTMarketplace.json');
    if (fs.existsSync(marketplacePath)) {
      const marketplaceArtifact = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
      const marketplaceBytecode = marketplaceArtifact.bytecode;
      
      const marketplaceId = await deployContract(
        client,
        'NFTMarketplace',
        marketplaceBytecode,
        4000000
      );
      deploymentInfo.contracts.NFTMarketplace = marketplaceId;
    } else {
      console.log('⚠️  NFTMarketplace.json not found. Run `npm run compile` first.');
    }

    // Deploy PrizeEscrow
    const escrowPath = path.join(artifactsPath, 'PrizeEscrow.sol/PrizeEscrow.json');
    if (fs.existsSync(escrowPath)) {
      const escrowArtifact = JSON.parse(fs.readFileSync(escrowPath, 'utf8'));
      const escrowBytecode = escrowArtifact.bytecode;
      
      const escrowId = await deployContract(
        client,
        'PrizeEscrow',
        escrowBytecode,
        4000000
      );
      deploymentInfo.contracts.PrizeEscrow = escrowId;
    } else {
      console.log('⚠️  PrizeEscrow.json not found. Run `npm run compile` first.');
    }

    // Deploy GuildTreasury
    const treasuryPath = path.join(artifactsPath, 'GuildTreasury.sol/GuildTreasury.json');
    if (fs.existsSync(treasuryPath)) {
      const treasuryArtifact = JSON.parse(fs.readFileSync(treasuryPath, 'utf8'));
      const treasuryBytecode = treasuryArtifact.bytecode;
      
      const treasuryId = await deployContract(
        client,
        'GuildTreasury',
        treasuryBytecode,
        4000000
      );
      deploymentInfo.contracts.GuildTreasury = treasuryId;
    } else {
      console.log('⚠️  GuildTreasury.json not found. Run `npm run compile` first.');
    }

    // Save deployment info
    const deploymentDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentDir, `${network}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✨ Deployment Complete! ✨');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 Contract IDs:');
    
    if (deploymentInfo.contracts.NFTMarketplace) {
      console.log(`   NFTMarketplace:  ${deploymentInfo.contracts.NFTMarketplace}`);
    }
    if (deploymentInfo.contracts.PrizeEscrow) {
      console.log(`   PrizeEscrow:     ${deploymentInfo.contracts.PrizeEscrow}`);
    }
    if (deploymentInfo.contracts.GuildTreasury) {
      console.log(`   GuildTreasury:   ${deploymentInfo.contracts.GuildTreasury}`);
    }

    console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Update .env with contract IDs:');
    if (deploymentInfo.contracts.NFTMarketplace) {
      console.log(`      NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID="${deploymentInfo.contracts.NFTMarketplace}"`);
    }
    if (deploymentInfo.contracts.PrizeEscrow) {
      console.log(`      NEXT_PUBLIC_PRIZE_ESCROW_CONTRACT_ID="${deploymentInfo.contracts.PrizeEscrow}"`);
    }
    if (deploymentInfo.contracts.GuildTreasury) {
      console.log(`      NEXT_PUBLIC_GUILD_TREASURY_CONTRACT_ID="${deploymentInfo.contracts.GuildTreasury}"`);
    }
    console.log('   2. Run: bun dev');
    console.log('   3. Test marketplace at http://localhost:3000/marketplace\n');

    client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    client.close();
    process.exit(1);
  }
}

main();
