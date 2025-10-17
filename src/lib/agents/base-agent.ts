import { HederaAgentKit } from 'hedera-agent-kit';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export interface AgentConfig {
  name: string;
  type: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentResponse {
  message: string;
  action?: string;
  data?: any;
  cost?: number;
}

/**
 * Base Agent class for all AI agents in HederaVerse
 */
export class BaseAgent {
  protected agentKit: HederaAgentKit;
  protected llm: ChatOpenAI;
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;

    // Initialize Hedera Agent Kit
    this.agentKit = new HederaAgentKit(
      process.env.HEDERA_ACCOUNT_ID!,
      process.env.HEDERA_PRIVATE_KEY!,
      process.env.HEDERA_NETWORK as 'testnet' | 'mainnet'
    );

    // Initialize LLM
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Process a user message
   */
  async processMessage(userMessage: string, context?: any): Promise<AgentResponse> {
    const messages = [
      new SystemMessage(this.config.systemPrompt),
      new HumanMessage(userMessage),
    ];

    if (context) {
      messages.splice(1, 0, new SystemMessage(`Context: ${JSON.stringify(context)}`));
    }

    const response = await this.llm.invoke(messages);
    
    return {
      message: response.content.toString(),
      cost: this.calculateCost(response),
    };
  }

  /**
   * Execute an action using Hedera Agent Kit
   */
  async executeAction(action: string, params: any): Promise<any> {
    // This will be overridden by specific agents
    throw new Error('executeAction must be implemented by subclass');
  }

  /**
   * Calculate API cost
   */
  protected calculateCost(response: any): number {
    // Rough estimation: $0.01 per 1K tokens for GPT-4
    const tokens = response.content.length / 4; // Rough token estimate
    return (tokens / 1000) * 0.01;
  }

  /**
   * Get agent statistics
   */
  getStats(): any {
    return {
      name: this.config.name,
      type: this.config.type,
    };
  }
}
