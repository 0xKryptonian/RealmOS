
import {
    Client,
    TopicCreateTransaction,
    PrivateKey,
    AccountId,
} from '@hashgraph/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' }); // Load from .env file

async function setupActivityFeed() {
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be present in .env');
    }

    const client = Client.forTestnet();
    client.setOperator(
        AccountId.fromString(operatorId),
        PrivateKey.fromString(operatorKey)
    );

    console.log('Creating HCS Topic for Activity Feed...');

    // Ensure client time is synced or just execute fresh
    const tx = new TopicCreateTransaction()
        .setTopicMemo('RealmOS Activity Feed')
        .setTransactionValidDuration(120); // 2 minutes window

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);
    const topicId = receipt.topicId;

    if (!topicId) {
        throw new Error('Failed to create topic');
    }

    console.log(`✅ Activity Feed Topic Created: ${topicId.toString()}`);

    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    if (envContent.includes('NEXT_PUBLIC_ACTIVITY_TOPIC_ID=')) {
        envContent = envContent.replace(
            /NEXT_PUBLIC_ACTIVITY_TOPIC_ID=.*/g,
            `NEXT_PUBLIC_ACTIVITY_TOPIC_ID=${topicId.toString()}`
        );
    } else {
        envContent += `\nNEXT_PUBLIC_ACTIVITY_TOPIC_ID=${topicId.toString()}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env with NEXT_PUBLIC_ACTIVITY_TOPIC_ID');
}

setupActivityFeed().catch(console.error);
