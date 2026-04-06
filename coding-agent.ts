import { BaseAgent } from './base-agent';
import type { AgentMessage, AgentContext, AgentResponse, ToolDefinition, ToolResult, AgentCapability } from '@opentegrate/core';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const CODING_CAPABILITIES: AgentCapability[] = [
  { id: 'code-complete', name: 'Code Completion', description: 'Generate code completions' },
  { id: 'code-explain', name: 'Code Explanation', description: 'Explain code behavior' },
  { id: 'code-refactor', name: 'Code Refactoring', description: 'Refactor and improve code' },
  { id: 'code-debug', name: 'Debugging', description: 'Debug errors and issues' },
  { id: 'code-test', name: 'Test Generation', description: 'Generate unit tests' },
  { id: 'code-review', name: 'Code Review', description: 'Review code quality' },
  { id: 'file-read', name: 'File Read', description: 'Read file contents' },
  { id: 'file-write', name: 'File Write', description: 'Write to files' },
  { id: 'search', name: 'Codebase Search', description: 'Search across project files' },
];

export class CodingAgent extends BaseAgent {
  private workspaceRoot: string;

  constructor(options: { workspaceRoot?: string } = {}) {
    super('coding-agent', 'Coding Agent', CODING_CAPABILITIES);
    this.workspaceRoot = options.workspaceRoot ?? process.cwd();
  }

  async send(message: AgentMessage, context: AgentContext): Promise<AgentResponse> {
    const startTime = Date.now();
    const systemPrompt = this.buildSystemPrompt(context);
    const fullMessage = `${systemPrompt}\n\nUser: ${message.content}`;

    // In production, this would call the LLM router with the coding-optimized prompt
    // For now, return a structured response that demonstrates the agent's capabilities
    let response = '';

    if (context.currentFile) {
      try {
        const filePath = path.resolve(this.workspaceRoot, context.currentFile);
        await stat(filePath);
        const content = await readFile(filePath, 'utf-8');
        response = `I can see you're working on \`${context.currentFile}\`. `;

        if (message.content.toLowerCase().includes('explain')) {
          response += `This file contains ${content.split('\n').length} lines. `;
          response += `Let me break down the structure and key components...`;
        } else if (message.content.toLowerCase().includes('refactor') || message.content.toLowerCase().includes('improve')) {
          response += `I'll analyze this file for improvement opportunities...`;
        } else if (message.content.toLowerCase().includes('test')) {
          response += `I'll generate appropriate tests for this file...`;
        } else {
          response += `How can I help you with this file?`;
        }
      } catch {
        response = `I couldn't find the file \`${context.currentFile}\`. Please check the path.`;
      }
    } else {
      response = `I'm ready to help with coding tasks. `;
      response += `You can ask me to explain code, refactor, debug, or generate tests. `;
      response += `Open a file or provide a code snippet to get started.`;
    }

    const duration = Date.now() - startTime;

    return this.buildResponse(response, context, { tokensUsed: fullMessage.length / 4, duration });
  }

  async executeTool(tool: ToolDefinition, input: unknown): Promise<ToolResult> {
    try {
      switch (tool.id) {
        case 'file-read': {
          const filePath = (input as any).path as string;
          const fullPath = path.resolve(this.workspaceRoot, filePath);
          const content = await readFile(fullPath, 'utf-8');
          return { success: true, content };
        }
        case 'file-write': {
          const { path: filePath, content } = input as { path: string; content: string };
          const { writeFile, mkdir } = await import('node:fs/promises');
          const fullPath = path.resolve(this.workspaceRoot, filePath);
          await mkdir(path.dirname(fullPath), { recursive: true });
          await writeFile(fullPath, content, 'utf-8');
          return { success: true, content: `File written: ${filePath}` };
        }
        case 'search': {
          const { query, path: searchPath } = input as { query: string; path?: string };
          const { searchInFiles } = await import('@opentegrate/services/search');
          const results = await searchInFiles(
            path.resolve(this.workspaceRoot, searchPath ?? '.'),
            query,
            { maxResults: 50, contextLines: 2 }
          );
          return { success: true, content: `Found ${results.length} matches for "${query}"` };
        }
        default:
          return { success: false, error: `Unknown tool: ${tool.id}` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private buildSystemPrompt(context: AgentContext): string {
    const parts = [
      'You are an expert coding assistant specializing in software development.',
      `Current workspace: ${this.workspaceRoot}`,
    ];

    if (context.currentFile) {
      parts.push(`Current file: ${context.currentFile}`);
    }
    if (context.language) {
      parts.push(`Language: ${context.language}`);
    }
    if (context.selectedCode) {
      parts.push(`Selected code:\n\`\`\`\n${context.selectedCode}\n\`\`\``);
    }

    parts.push(
      'Guidelines:',
      '- Provide precise, code-focused responses',
      '- Include code examples with proper syntax highlighting',
      '- Consider best practices, performance, and security',
      '- Explain complex concepts clearly',
      '- Suggest refactoring opportunities when relevant',
      '- Be aware of the project context and file structure',
    );

    return parts.join('\n');
  }
}
