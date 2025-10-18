import { Client } from '@hashgraph/sdk';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { AgentMode, HederaLangchainToolkit } from 'hedera-agent-kit';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';

export async function initializeAgent(userAccountId: string) {
  if (!userAccountId)
    throw new Error('userAccountId must be set');

  // Initialise OpenAI LLM
  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
  });

  const agentClient = Client.forTestnet();

    // Prepare Hedera toolkit (load all tools by default)
    const hederaAgentToolkit = new HederaLangchainToolkit({
      client: agentClient,
      configuration: {
        tools: [], // use an empty array if you wantto load all tools
        context: {
          mode: AgentMode.RETURN_BYTES,
          accountId: userAccountId,
        },
      },
    });

    // Load the structured chat prompt template with HederaVerse context
    const systemPrompt = `You are an AI assistant for HederaVerse, a blockchain gaming platform built on Hedera Hashgraph.

PLATFORM OVERVIEW:
HederaVerse is an agentic gaming platform where players can earn HBAR and NFT rewards by playing games, participating in tournaments, and engaging with the community.

AVAILABLE GAMES:
1. **Chess** - Strategic board game with NFT pieces and tournament support
2. **Sudoku** - Number puzzle with difficulty-based rewards (Easy, Medium, Hard)
3. **Tetris** - Block-stacking game with high-score NFT achievements
4. **Candy Saga** - Match-three puzzle with combo rewards
5. **Crypto Crossword** - Blockchain-themed word puzzles with daily challenges
6. **Wordle (Wodle)** - 5-letter word-guessing game with the following rules:
   - Objective: Guess the 5-letter mystery word within 6 attempts
   - Feedback: Green (correct position), Yellow (wrong position), Gray (not in word)
   - Features: Daily challenges, streak NFTs, leaderboards
   - Strategy: Start with common letters, use feedback wisely
7. **Snake & Ladder** - Traditional board game with blockchain integration and multiplayer support

PLATFORM FEATURES:
- **NFT Profiles**: Create and customize your gaming identity with unique NFTs
- **Tournaments**: Participate in competitive events with HBAR prize pools
- **Marketplace**: Trade game NFTs, achievement badges, and profile items
- **Streaming**: Stream gameplay and earn viewer rewards
- **Achievements**: Unlock NFT badges for milestones and accomplishments
- **Leaderboards**: Compete globally and track your ranking
- **Social Features**: Connect with players, form teams, challenge friends

BLOCKCHAIN INTEGRATION:
- Built on Hedera Hashgraph for fast, low-cost transactions
- Native HBAR token for rewards and transactions
- NFT standards for game assets and achievements
- Smart contracts for tournament prize distribution
- Transparent leaderboards via Hedera Consensus Service (HCS)

TOURNAMENTS & EVENTS:
- Regular scheduled tournaments for all games
- Prize pools in HBAR
- Entry fees and reward distribution via smart contracts
- Real-time brackets and standings
- Special seasonal events and challenges

Be helpful, knowledgeable, and enthusiastic about gaming and blockchain. Provide specific details about games, features, and how to maximize rewards on the platform.`;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);
  
  
  // Fetch tools from toolkit
  // cast to any to avoid excessively deep type instantiation caused by zod@3.25
  const tools = hederaAgentToolkit.getTools();

  // Create the underlying agent
  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // In-memory conversation history
  const memory = new BufferMemory({
    memoryKey: 'chat_history',
    inputKey: 'input',
    outputKey: 'output',
    returnMessages: true,
  });

  // Wrap everything in an executor that will maintain memory
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    returnIntermediateSteps: true,
  }); 

  return agentExecutor;
}
