
import { HederaClient } from '../src/lib/hedera/client';
import { HederaConsensusService } from '../src/lib/hedera/consensus';
import * as fs from 'fs';
import * as path from 'path';

async function setupChat() {
  console.log('🚀 Setting up Global Chat...\n');

  try {
    // Initialize Hedera client
    const client = HederaClient.initialize();
    
    // Create Chat Topic
    console.log('Creating Global Chat HCS Topic...');
    const chatTopic = await HederaConsensusService.createTopic({
      memo: 'RealmOS Global Chat',
    });
    
    console.log(`✅ Global Chat Topic Created: ${chatTopic.toString()}`);
    
    // Update .env
    updateEnvFile({
      NEXT_PUBLIC_GLOBAL_CHAT_TOPIC_ID: chatTopic.toString()
    });
    
    console.log('✅ Environment updated. You may need to restart the dev server.');

    await HederaClient.close();
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent += `\n${key}="${value}"`;
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');
}

setupChat();
