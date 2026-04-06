import { AgentOrchestrator } from '../assistant/src/orchestrator.js';
import { CodingAgent } from './coding-agent.js';
import { ChatAgent } from './chat-agent.js';
import { LLMService } from '../services/src/llm/service.js';
import { ConfigManager } from '@opentegrate/core/config';
import type { ProviderConfig } from '@opentegrate/core/types/unified';
import type { AgentMessage, AgentContext, AgentResponse } from '@opentegrate/core';

export class AgentService {
  private static instance: AgentService;
  private orchestrator: AgentOrchestrator | null = null;
  private llmService: LLMService;
  private configManager: ConfigManager;
  private initialized = false;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.llmService = LLMService.getInstance(configManager);
  }

  static getInstance(configManager?: ConfigManager): AgentService {
    if (!AgentService.instance) {
      if (!configManager) {
        throw new Error('ConfigManager required for first initialization');
      }
      AgentService.instance = new AgentService(configManager);
    }
    return AgentService.instance;
  }

  async initialize(): Promise<AgentOrchestrator> {
    if (this.initialized && this.orchestrator) {
      return this.orchestrator;
    }

    console.log('🚀 Initializing Agent Service...');

    // Initialize LLM service first
    const router = await this.llmService.initialize();
    console.log('✓ LLM Router initialized');

    // Get agent configurations
    const config = this.configManager.getConfig();
    const codingConfig = config.agents.coding;
    const chatConfig = config.agents.chat;

    // Create agents
    const codingAgent = new CodingAgent({
      workspaceRoot: codingConfig.workspaceRoot,
    });

    const chatAgent = new ChatAgent({
      channels: chatConfig.channels,
      rememberHistory: chatConfig.rememberHistory,
    });

    // Wire agents to LLM router
    await this.wireAgentsToLLM(codingAgent, chatAgent, router);

    // Create orchestrator
    this.orchestrator = new AgentOrchestrator(codingAgent, chatAgent);
    this.initialized = true;

    console.log('✓ Agent Service initialized successfully');
    return this.orchestrator;
  }

  private async wireAgentsToLLM(
    codingAgent: CodingAgent,
    chatAgent: ChatAgent,
    router: LLMRouter
  ): Promise<void> {
    // Override the agents' send methods to use the LLM router
    const originalCodingSend = codingAgent.send.bind(codingAgent);
    const originalChatSend = chatAgent.send.bind(chatAgent);

    // Get default models from config
    const config = this.configManager.getConfig();
    const codingModel = config.agents.coding.model;
    const chatModel = config.agents.chat.model;
    const codingProvider = this.getProviderForModel(codingModel);
    const chatProvider = this.getProviderForModel(chatModel);

    codingAgent.send = async (message: AgentMessage, context: AgentContext): Promise<AgentResponse> => {
      try {
        const startTime = Date.now();
        
        // Build system prompt for coding
        const systemPrompt = this.buildCodingSystemPrompt(context);
        
        // Prepare LLM request
        const request = {
          model: codingModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user' as const, content: message.content },
          ],
          system: systemPrompt,
          temperature: 0.1, // Lower temperature for coding
          maxTokens: config.agents.coding.maxTokens,
        };

        // Call LLM
        const response = await router.generate(request, { 
          preferredProvider: codingProvider,
          taskType: 'coding' 
        });
        
        return {
          content: response.content,
          toolCalls: response.toolCalls,
          metadata: {
            agentUsed: 'coding-agent',
            tokensUsed: response.usage.totalTokens,
            duration: Date.now() - startTime,
          },
        };
      } catch (error) {
        console.error('CodingAgent LLM call failed:', error);
        // Fallback to original implementation
        return originalCodingSend(message, context);
      }
    };

    chatAgent.send = async (message: AgentMessage, context: AgentContext): Promise<AgentResponse> => {
      try {
        const startTime = Date.now();
        
        // Build system prompt for chat
        const systemPrompt = this.buildChatSystemPrompt(context);
        
        // Include history if available
        const messages = [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          ...(context.history || []),
          { role: 'user' as const, content: message.content },
        ];
        
        // Prepare LLM request
        const request = {
          model: chatModel,
          messages,
          system: systemPrompt,
          temperature: 0.7, // More creative for chat
          maxTokens: config.agents.chat.maxTokens,
        };

        // Call LLM
        const response = await router.generate(request, { 
          preferredProvider: chatProvider,
          taskType: 'chat' 
        });
        
        return {
          content: response.content,
          toolCalls: response.toolCalls,
          metadata: {
            agentUsed: 'chat-agent',
            tokensUsed: response.usage.totalTokens,
            duration: Date.now() - startTime,
          },
        };
      } catch (error) {
        console.error('ChatAgent LLM call failed:', error);
        // Fallback to original implementation
        return originalChatSend(message, context);
      }
    };
  }

  private buildCodingSystemPrompt(context: AgentContext): string {
    const config = this.configManager.getConfig();
    return `You are an expert AI coding assistant with deep knowledge of programming languages, frameworks, and best practices.

Your capabilities include:
${config.agents.coding.tools?.map(tool => `- ${tool}`).join('\n') || ''}

Current context:
- Workspace: ${context.workspaceRoot || process.cwd()}
- Current file: ${context.currentFile || 'None'}
- Language: ${context.language || 'Unknown'}

Provide precise, code-focused responses with examples where relevant. Consider performance, security, and best practices. Suggest improvements and refactorings when appropriate.`;
  }

  private buildChatSystemPrompt(context: AgentContext): string {
    const config = this.configManager.getConfig();
    return `You are a helpful AI assistant capable of answering questions, holding conversations, and assisting with various tasks.

Your enabled skills: ${config.agents.chat.skills?.join(', ') || 'General assistance'}

Be conversational, natural, and informative. Adapt to the user's tone and needs. Use appropriate formatting (markdown).

Current context: ${context.projectType || 'General conversation'}`;
  }

  private getProviderForModel(model: string): string | undefined {
    // Extract provider from model name/model ID
    if (model.includes('gpt') || model.includes('o1') || model.includes('dall-e')) return 'openai';
    if (model.includes('claude') || model.includes('haiku') || model.includes('sonnet') || model.includes('opus')) return 'anthropic';
    if (model.includes('llama') || model.includes('mistral') || model.includes('mixtral')) return 'ollama';
    if (model.includes('gemini')) return 'google';
    return undefined; // Let router decide
  }

  async processMessage(userInput: string, context: AgentContext): Promise<AgentResponse> {
    if (!this.orchestrator) {
      throw new Error('AgentService not initialized. Call initialize() first.');
    }

    return await this.orchestrator.routeAndExecute(userInput, context);
  }

  getOrchestrator(): AgentOrchestrator | null {
    return this.orchestrator;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
