/**
 * Hedera Setup Script
 * Creates all necessary tokens and HCS topics for HederaVerse
 * 
 * Run with: bun run scripts/setup-hedera.ts
 */

import { HederaClient } from '../src/lib/hedera/client';
import { HederaTokenService } from '../src/lib/hedera/token';
import { HederaConsensusService } from '../src/lib/hedera/consensus';
import * as fs from 'fs';
import * as path from 'path';

async function setupHedera() {
  console.log('🚀 Starting HederaVerse Setup...\n');

  try {
    // Initialize Hedera client
    const client = HederaClient.initialize();
    const operatorId = HederaClient.getOperatorId();
    const operatorKey = HederaClient.getOperatorKey();

    console.log(`✅ Connected to Hedera ${process.env.HEDERA_NETWORK}`);
    console.log(`📍 Operator Account: ${operatorId.toString()}\n`);

    const envUpdates: Record<string, string> = {};

    // 1. Create REALM Token (Platform Currency)
    console.log('1️⃣  Creating REALM Token...');
    const realmToken = await HederaTokenService.createFungibleToken({
      name: 'HederaVerse REALM',
      symbol: 'REALM',
      decimals: 8,
      initialSupply: 1000000, // 1 million initial supply
      maxSupply: 100000000, // 100 million max supply
      treasuryId: operatorId,
      adminKey: operatorKey,
      supplyKey: operatorKey,
    });
    envUpdates.REALM_TOKEN_ID = realmToken.toString();
    console.log(`   ✅ REALM Token: ${realmToken.toString()}\n`);

    // 2. Create Profile NFT Collection
    console.log('2️⃣  Creating Profile NFT Collection...');
    const profileNFT = await HederaTokenService.createNFTCollection({
      name: 'HederaVerse Profile',
      symbol: 'HVPROFILE',
      treasuryId: operatorId,
      adminKey: operatorKey,
      supplyKey: operatorKey,
    });
    envUpdates.PROFILE_NFT_TOKEN_ID = profileNFT.toString();
    console.log(`   ✅ Profile NFT: ${profileNFT.toString()}\n`);

    // 3. Create Game Asset NFT Collection
    console.log('3️⃣  Creating Game Asset NFT Collection...');
    const gameNFT = await HederaTokenService.createNFTCollection({
      name: 'HederaVerse Game Assets',
      symbol: 'HVGAME',
      treasuryId: operatorId,
      adminKey: operatorKey,
      supplyKey: operatorKey,
    });
    envUpdates.GAME_NFT_TOKEN_ID = gameNFT.toString();
    console.log(`   ✅ Game NFT: ${gameNFT.toString()}\n`);

    // 4. Create Achievement NFT Collection
    console.log('4️⃣  Creating Achievement NFT Collection...');
    const achievementNFT = await HederaTokenService.createNFTCollection({
      name: 'HederaVerse Achievements',
      symbol: 'HVACH',
      treasuryId: operatorId,
      adminKey: operatorKey,
      supplyKey: operatorKey,
    });
    envUpdates.ACHIEVEMENT_NFT_TOKEN_ID = achievementNFT.toString();
    console.log(`   ✅ Achievement NFT: ${achievementNFT.toString()}\n`);

    // 5. Create Leaderboard HCS Topic
    console.log('5️⃣  Creating Leaderboard HCS Topic...');
    const leaderboardTopic = await HederaConsensusService.createTopic({
      memo: 'HederaVerse Leaderboard',
      adminKey: operatorKey,
    });
    envUpdates.LEADERBOARD_TOPIC_ID = leaderboardTopic.toString();
    console.log(`   ✅ Leaderboard Topic: ${leaderboardTopic.toString()}\n`);

    // 6. Create Game Events HCS Topic
    console.log('6️⃣  Creating Game Events HCS Topic...');
    const gameEventsTopic = await HederaConsensusService.createTopic({
      memo: 'HederaVerse Game Events',
      adminKey: operatorKey,
    });
    envUpdates.GAME_EVENTS_TOPIC_ID = gameEventsTopic.toString();
    console.log(`   ✅ Game Events Topic: ${gameEventsTopic.toString()}\n`);

    // 7. Create Tournament HCS Topic
    console.log('7️⃣  Creating Tournament HCS Topic...');
    const tournamentTopic = await HederaConsensusService.createTopic({
      memo: 'HederaVerse Tournaments',
      adminKey: operatorKey,
    });
    envUpdates.TOURNAMENT_TOPIC_ID = tournamentTopic.toString();
    console.log(`   ✅ Tournament Topic: ${tournamentTopic.toString()}\n`);

    // Update .env file
    console.log('8️⃣  Updating .env file...');
    updateEnvFile(envUpdates);
    console.log('   ✅ Environment variables updated\n');

    // Print summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ HederaVerse Setup Complete! ✨');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Summary:');
    console.log(`   REALM Token:        ${envUpdates.REALM_TOKEN_ID}`);
    console.log(`   Profile NFT:        ${envUpdates.PROFILE_NFT_TOKEN_ID}`);
    console.log(`   Game NFT:           ${envUpdates.GAME_NFT_TOKEN_ID}`);
    console.log(`   Achievement NFT:    ${envUpdates.ACHIEVEMENT_NFT_TOKEN_ID}`);
    console.log(`   Leaderboard Topic:  ${envUpdates.LEADERBOARD_TOPIC_ID}`);
    console.log(`   Game Events Topic:  ${envUpdates.GAME_EVENTS_TOPIC_ID}`);
    console.log(`   Tournament Topic:   ${envUpdates.TOURNAMENT_TOPIC_ID}`);
    console.log('\n🎮 Next Steps:');
    console.log('   1. Run: bun run build:prisma');
    console.log('   2. Run: bun run dev');
    console.log('   3. Visit: http://localhost:3000');
    console.log('\n');

    await HederaClient.close();
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Update or add each variable
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent += `\n${key}="${value}"`;
    }
  }

  // Write updated content
  fs.writeFileSync(envPath, envContent.trim() + '\n');
}

// Run setup
setupHedera();
