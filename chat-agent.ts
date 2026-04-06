import { BaseAgent } from './base-agent';
import type { AgentMessage, AgentContext, AgentResponse, ToolDefinition, ToolResult, AgentCapability } from '@opentegrate/core';

const CHAT_CAPABILITIES: AgentCapability[] = [
  { id: 'conversation', name: 'Conversation', description: 'Natural language conversation' },
  { id: 'web-search', name: 'Web Search', description: 'Search the web for information' },
  { id: 'file-ops', name: 'File Operations', description: 'Read and write files' },
  { id: 'weather', name: 'Weather', description: 'Get weather information' },
  { id: 'calendar', name: 'Calendar', description: 'Manage calendar events' },
  { id: 'email', name: 'Email', description: 'Send and read emails' },
  { id: 'reminder', name: 'Reminders', description: 'Set and manage reminders' },
  { id: 'summarize', name: 'Summarization', description: 'Summarize long content' },
];

export class ChatAgent extends BaseAgent {
  private conversationHistory: AgentMessage[] = [];
  private maxHistory: number;

  constructor(options: { maxHistory?: number } = {}) {
    super('chat-agent', 'Chat Agent', CHAT_CAPABILITIES);
    this.maxHistory = options.maxHistory ?? 50;
  }

  async send(message: AgentMessage, context: AgentContext): Promise<AgentResponse> {
    const startTime = Date.now();

    this.conversationHistory.push(message);
    if (this.conversationHistory.length > this.maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistory);
    }

    const systemPrompt = this.buildSystemPrompt(context);
    const fullMessage = `${systemPrompt}\n\nUser: ${message.content}`;

    let response = '';
    const lower = message.content.toLowerCase();

    if (lower.startsWith('hello') || lower.startsWith('hi') || lower.startsWith('hey')) {
      response = `Hello! I'm your AI assistant. I can help with questions, tasks, research, writing, and much more. What can I help you with today?`;
    } else if (lower.includes('weather')) {
      response = `I can help you check the weather. In a production environment, I would connect to a weather API to provide real-time data. For now, I can tell you that you can set up weather integration through the channels configuration.`;
    } else if (lower.includes('search') || lower.includes('find') || lower.includes('look up')) {
      response = `I can search for information on the web. In production, this would use the web search tool to find current information. What would you like me to search for?`;
    } else if (lower.includes('summarize') || lower.includes('summary')) {
      response = `I can summarize content for you. Please provide the text or document you'd like me to summarize, and I'll create a concise summary highlighting the key points.`;
    } else if (lower.includes('write') || lower.includes('draft') || lower.includes('compose')) {
      response = `I'd be happy to help you write content. Please tell me what you need - an email, article, report, creative piece, or something else? The more details you provide about the topic, tone, and audience, the better I can tailor the content.`;
    } else {
      response = `I understand your request: "${message.content}". `;
      response += `I'm here to help with general questions, tasks, and conversations. `;
      response += `I can search the web, manage files, check weather, set reminders, and more. `;
      response += `What specific task would you like me to help with?`;
    }

    const duration = Date.now() - startTime;
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    });

    return this.buildResponse(response, context, { tokensUsed: fullMessage.length / 4, duration });
  }

  async executeTool(tool: ToolDefinition, input: unknown): Promise<ToolResult> {
    try {
      switch (tool.id) {
        case 'web-search': {
          const query = (input as any).query as string;
          return { success: true, content: `Search results for: "${query}"` };
        }
        case 'file-read': {
          const { promises: fs } = await import('node:fs/promises');
          const filePath = (input as any).path as string;
          const content = await fs.readFile(filePath, 'utf-8');
          return { success: true, content };
        }
        case 'file-write': {
          const { writeFile, mkdir } = await import('node:fs/promises');
          const path = await import('node:path');
          const { path: filePath, content } = input as { path: string; content: string };
          const fullPath = path.resolve(filePath);
          await mkdir(path.dirname(fullPath), { recursive: true });
          await writeFile(fullPath, content, 'utf-8');
          return { success: true, content: `File written: ${filePath}` };
        }
        case 'reminder': {
          const { message, time } = input as { message: string; time: string };
          return { success: true, content: `Reminder set: "${message}" at ${time}` };
        }
        default:
          return { success: false, error: `Unknown tool: ${tool.id}` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  getHistory(): AgentMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  private buildSystemPrompt(context: AgentContext): string {
    const parts = [
      'You are a helpful AI assistant capable of answering questions, holding conversations, and using various tools.',
      `Current time: ${new Date().toISOString()}`,
    ];

    if (context.workspaceRoot) {
      parts.push(`Workspace: ${context.workspaceRoot}`);
    }

    parts.push(
      'Guidelines:',
      '- Be conversational and natural',
      '- Provide informative and well-structured responses',
      '- Adapt to the user\'s tone and needs',
      '- Use appropriate formatting (markdown)',
      '- Be concise but thorough',
      '- Use tools when appropriate to provide accurate information',
    );

    return parts.join('\n');
  }
}
