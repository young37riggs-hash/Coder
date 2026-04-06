import type { IUnifiedAgent, AgentMessage, AgentContext, AgentResponse, ToolDefinition, ToolResult, AgentCapability } from '@opentegrate/core';
import { generateId } from '@opentegrate/core';

export abstract class BaseAgent implements IUnifiedAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly capabilities: AgentCapability[];

  constructor(id: string, name: string, capabilities: AgentCapability[]) {
    this.id = id;
    this.name = name;
    this.capabilities = capabilities;
  }

  abstract send(message: AgentMessage, context: AgentContext): Promise<AgentResponse>;
  abstract executeTool(tool: ToolDefinition, input: unknown): Promise<ToolResult>;

  protected buildResponse(content: string, context: AgentContext, options: { toolCalls?: any[]; tokensUsed?: number } = {}): AgentResponse {
    return {
      content,
      toolCalls: options.toolCalls,
      metadata: {
        agentUsed: this.id,
        tokensUsed: options.tokensUsed ?? content.length / 4,
        duration: 0,
      },
    };
  }

  protected async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Agent operation timed out after ${timeoutMs}ms`)), timeoutMs);
      fn().then(result => {
        clearTimeout(timeout);
        resolve(result);
      }).catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
}
