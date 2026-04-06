import type { IUnifiedAgent } from '@opentegrate/core';

export class AgentRegistry {
  private agents = new Map<string, IUnifiedAgent>();
  private defaultAgent: string | null = null;

  register(agent: IUnifiedAgent, isDefault = false): void {
    this.agents.set(agent.id, agent);
    if (isDefault || !this.defaultAgent) {
      this.defaultAgent = agent.id;
    }
  }

  unregister(id: string): boolean {
    const removed = this.agents.delete(id);
    if (this.defaultAgent === id) {
      this.defaultAgent = this.agents.keys().next().value ?? null;
    }
    return removed;
  }

  get(id: string): IUnifiedAgent | undefined {
    return this.agents.get(id);
  }

  getDefault(): IUnifiedAgent | undefined {
    if (!this.defaultAgent) return undefined;
    return this.agents.get(this.defaultAgent);
  }

  setDefault(id: string): boolean {
    if (!this.agents.has(id)) return false;
    this.defaultAgent = id;
    return true;
  }

  getAll(): IUnifiedAgent[] {
    return Array.from(this.agents.values());
  }

  getIds(): string[] {
    return Array.from(this.agents.keys());
  }

  has(id: string): boolean {
    return this.agents.has(id);
  }

  get size(): number {
    return this.agents.size;
  }
}
