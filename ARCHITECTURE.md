# Opentegrate System Architecture

## Executive Summary

Opentegrate is a unified AI-powered operating environment that combines:
- **OpenCode**: AI-powered code editor/IDE with TUI capabilities
- **OpenClaw**: Multi-channel AI assistant with extensive messaging integrations

The system provides a seamless experience where users can switch between coding assistance and general AI conversation without context loss, all from a single unified interface.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            USER INTERFACES                                   │
├─────────────┬──────────────┬───────────────┬─────────────────────────────────┤
│   Terminal  │   Web GUI    │   Desktop     │        Mobile                   │
│   (TUI)     │   (React)    │   (Tauri)     │        (React Native)           │
└──────┬──────┴──────┬───────┴──────┬──────┴──────────────┬──────────────────┘
       │             │              │                     │
       └─────────────┴──────────────┴─────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Unified Command Palette │ Context-aware Panels │ Adaptive UI Components │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Coding Agent │  │ Chat Agent   │  │ Workspace    │  │  Command Router  │ │
│  │ (OpenCode)   │  │ (OpenClaw)   │  │ Manager      │  │                  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
└───────────────────────────┬──────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────────────┐
│                         SERVICE LAYER                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ LLM Router   │  │ Tool Engine  │  │ File System  │  │  Event Bus       │ │
│  │              │  │              │  │              │  │  (Effect-based)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Messaging    │  │ Search &     │  │ Storage      │  │  Plugin System   │ │
│  │ Bridge       │  │ Indexing     │  │ Layer        │  │                  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
└───────────────────────────┬──────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────────────┐
│                         INFRASTRUCTURE LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Config Manager │ Logger │ Auth │ Cache │ Metrics │ Health Checker      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────────────┐
│                         PERSISTENCE LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ SQLite/Drizzle│ │ JSON Config  │ │  Cache (LRU) │ │  File System     │ │
│  │              │ │              │ │              │ │  (Native)        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Core Subsystems

### 1. Dual-Agent System

```typescript
// Unified agent interface
interface IUnifiedAgent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
  
  // Send message to agent
  send(message: AgentMessage, context: AgentContext): Promise<AgentResponse>;
  
  // Stream response (optional)
  sendStream?(message: AgentMessage, onChunk: (chunk: string) => void): Promise<void>;
  
  // Execute tool call
  executeTool(tool: ToolDefinition, input: unknown): Promise<ToolResult>;
  
  // Get knowledge context
  getContext(query: string, maxTokens?: number): Promise<ContextResult>;
}

// Coding Agent (from OpenCode)
class CodingAgent implements IUnifiedAgent {
  // Specialized in code generation, editing, debugging
  // Uses OpenCode's indexing, completion, and refactoring capabilities
  // Context: project files, git history, language servers
}

// General Assistant Agent (from OpenClaw)
class ChatAgent implements IUnifiedAgent {
  // General conversation, tool usage, multi-channel messaging
  // Uses OpenClaw's skill system and channel integrations
  // Context: chat history, skills, external APIs
}

// Orchestrator - decides which agent to use
class AgentOrchestrator {
  async routeRequest(userInput: string, context: GlobalContext): Promise<IUnifiedAgent> {
    // Analyze intent, select appropriate agent(s)
    // Can combine both agents for complex tasks
  }
}
```

### 2. Unified LLM Service

```typescript
// Single interface for all LLM providers
interface ILlmProvider {
  id: string;
  name: string;
  supports: {
    streaming: boolean;
    vision: boolean;
    tools: boolean;
    reasoning: boolean;
  };
  
  generate(prompt: Prompt, options: GenerationOptions): Promise<GenerationResult>;
  stream?(prompt: Prompt, onChunk: (chunk: string) => void): Promise<void>;
  embed?(text: string): Promise<EmbeddingResult>;
}

// Provider implementations from both systems
class OpenAILlmProvider implements ILlmProvider { /* from OpenCode/OpenClaw */ }
class AnthropicLlmProvider implements ILlmProvider { /* merged implementation */ }
class LocalLlmProvider implements ILlmProvider { /* Ollama, etc. */ }

// Router that selects best provider based on task, cost, availability
class LlmRouter {
  private providers: Map<string, ILlmProvider>;
  private fallbackChains: Map<string, string[]>;
  
  async generate(task: LlmTask, prompt: Prompt): Promise<GenerationResult> {
    // Select primary provider
    // Fallback on failure/filter
    // Handle auth, rate limits, costs
  }
}
```

### 3. Unified Plugin System

```typescript
// Plugin manifest format (compatible with both systems)
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  
  // What system(s) does this plugin target?
  targets: ['opencode' | 'opencode-assistant' | 'opentegrate'][];
  
  // Entry points
  main: string;
  
  // Capabilities this plugin provides
  capabilities: {
    commands?: CommandDefinition[];        // CLI commands
    skills?: SkillDefinition[];            // Assistant skills (OpenClaw)
    providers?: LlmProviderDefinition[];  // LLM providers
    extensions?: ExtensionDefinition[];    // Editor extensions (OpenCode)
    channels?: MessagingChannelDefinition[]; // Chat channels (OpenClaw)
  };
  
  // Dependencies on other plugins
  dependencies?: string[];
  
  // Permissions required
  permissions: Permission[];
}

// Plugin loader with compatibility adapters
class PluginLoader {
  async load(manifest: PluginManifest): Promise<LoadedPlugin> {
    // Detect plugin type (OpenCode vs OpenClaw)
    // Wrap in appropriate adapter
    // Register with appropriate subsystems
  }
}
```

### 4. Storage Layer

```typescript
// Abstract storage interface
interface IStorageEngine {
  // Key-value operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  
  // Query operations (for structured data)
  query<T>(spec: QuerySpec): Promise<T[]>;
  insert<T>(collection: string, item: T): Promise<void>;
  update<T>(collection: string, id: string, updates: Partial<T>): Promise<void>;
  
  // Transactions
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}

// Implementations
class SqliteStorage implements IStorageEngine { /* Drizzle-based */ }
class JsonStorage implements IStorageEngine { /* File-based for simple configs */ }
class MultiStorage implements IStorageEngine { /* Routes to appropriate engine */ }

// Usage in application
const storage = new MultiStorage({
  structured: new SqliteStorage('data/main.db'),
  config: new JsonStorage('config/'),
  cache: new LruCacheStorage(100_000),
});
```

### 5. Event Bus

```typescript
// Central event bus using Effect patterns
class EventBus {
  private eventBus: Effect.EventBus;
  
  async publish<T>(event: Event<T>): Promise<void> {
    // Publish to all subscribers
    // Also log to storage for persistence/audit
  }
  
  async subscribe<T>(handler: EventHandler<T>): Promise<Unsubscribe> {
    // Register handler for specific event types
    // Auto-retry on errors, backpressure handling
  }
  
  async request<T>(event: RequestEvent<T>): Promise<T> {
    // Request-response pattern
    // Timeout handling
  }
}

// Core events
enum SystemEvent {
  // Agent lifecycle
  AgentStarted = 'agent.started',
  AgentStopped = 'agent.stopped',
  
  // User interaction
  MessageReceived = 'message.received',
  MessageSent = 'message.sent',
  
  // Tool execution
  ToolCalled = 'tool.called',
  ToolCompleted = 'tool.completed',
  ToolFailed = 'tool.failed',
  
  // System
  ConfigChanged = 'config.changed',
  PluginLoaded = 'plugin.loaded',
  PluginUnloaded = 'plugin.unloaded',
}
```

## Data Models

### Unified Configuration

```typescript
interface OpentegrateConfig {
  version: number;
  
  // General settings
  app: {
    name: string;
    theme: 'light' | 'dark' | 'system';
    defaultMode: 'tui' | 'gui' | 'web';
    telemetry: boolean;
  };
  
  // Agent configuration
  agents: {
    default: 'auto' | 'coding' | 'chat';
    coding: {
      enabled: boolean;
      model: ModelReference;
      maxTokens: number;
      contextWindow: number;
      tools: string[]; // Tool allowlist
    };
    chat: {
      enabled: boolean;
      model: ModelReference;
      skills: string[]; // Skill enablement
      channels: string[]; // Active channels
    };
  };
  
  // User interface
  ui: {
    tui: {
      keybindings: Keybinding[];
      cursor: 'block' | 'bar' | 'underline';
      showLineNumbers: boolean;
    };
    gui: {
      layout: 'default' | 'coding' | 'chat';
      panels: PanelConfig[];
      theme: ThemeConfig;
    };
  };
  
  // Storage
  storage: {
    database: string; // Path to SQLite
    configDir: string;
    cacheDir: string;
    backup: {
      enabled: boolean;
      interval: string;
      retention: number;
    };
  };
  
  // Security
  security: {
    requireAuth: boolean;
    sessionTimeout: string;
    allowedPlugins: string[];
    sandboxPlugins: boolean;
  };
  
  // LLM Providers
  providers: LlmProviderConfig[];
  
  // Messaging (from OpenClaw)
  channels: ChannelConfig[];
  
  // Editor/Development (from OpenCode)
  editor: EditorConfig;
  
  // Extensions
  plugins: {
    allow: string[];
    deny: string[];
    enabled: Record<string, PluginConfig>;
  };
}
```

### Unified Command System

```typescript
class CommandRouter {
  private commands: Map<string, CommandDefinition> = new Map();
  private contexts: Map<string, CommandContext[]> = new Map();
  
  register(command: CommandDefinition, context: CommandContext[] = ['global']) {
    this.commands.set(command.name, command);
    
    for (const ctx of context) {
      const ctxs = this.contexts.get(ctx) ?? [];
      ctxs.push(command);
      this.contexts.set(ctx, ctxs);
    }
  }
  
  async execute(input: string, context: CommandContext): Promise<CommandResult> {
    // Parse command (with context-aware suggestions)
    const [cmdName, ...args] = this.parse(input);
    
    // Find command (considering context)
    const candidateCommands = this.contexts.get(context) ?? this.contexts.get('global') ?? [];
    const command = candidateCommands.find(c => c.name === cmdName);
    
    if (!command) {
      throw new CommandNotFoundError(cmdName);
    }
    
    // Check permissions
    await this.checkPermissions(command, context);
    
    // Execute
    return await command.handler(args, context);
  }
  
  // Provide context-aware completions
  getCompletions(partial: string, context: CommandContext): string[] {
    const candidates = this.contexts.get(context) ?? this.contexts.get('global') ?? [];
    return candidates
      .filter(c => c.name.startsWith(partial))
      .map(c => c.name);
  }
}
```

## Integration Strategy

### Mixed Mode Operation

The system supports multiple operational modes:

1. **Developer Mode**: Pre-configured for coding tasks
   - Editor active by default
   - Coding agent prioritized
   - Project-aware context loading
   - Minimal chat interface (sidebar)

2. **Assistant Mode**: Pre-configured for general assistance
   - Chat interface full-screen
   - All skills/channels available
   - File operations secondary
   - Voice support enabled

3. **Mixed Mode**: Both interfaces available simultaneously
   - Split screen or tabbed interface
   - Shared context between modes
   - Agent orchestration automatically routes tasks

### Migration Path for Existing Users

```typescript
// During first launch, detect existing installations
class MigrationManager {
  async detectExisting() {
    const opencode = await this.detectOpenCode();
    const openclaw = await this.detectOpenClaw();
    
    return { opencode, openclaw };
  }
  
  async migrate(opencode?: OpenCodeData, openclaw?: OpenClawData) {
    // Preserve existing configurations
    // Convert plugin manifests to unified format
    // Merge skill/extension lists
    // Migrate database (if applicable)
    // Create unified configuration
    
    await this.backupExisting();
    await this.convertAndMerge();
    await this.setupUnifiedStorage();
  }
}
```

## Build & Deployment

### Monorepo Structure

```
opentegrate/
├── packages/
│   ├── @opentegrate/core/          # Shared types, utilities
│   │   └── src/
│   │       ├── types/              # TypeScript interfaces
│   │       ├── utils/              # Helper functions
│   │       ├── config/             # Configuration management
│   │       ├── events/             # Event definitions & bus
│   │       └── storage/            # Storage abstractions
│   │
│   ├── @opentegrate/cli/           # Command-line interface
│   │   └── src/
│   │       ├── commands/           # All CLI commands
│   │       ├── ui/                 # TUI components (blessed/ink)
│   │       ├── autocomplete/       # Command completion
│   │       └── index.ts
│   │
│   ├── @opentegrate/web/           # Web interface (React)
│   │   └── src/
│   │       ├── components/         # React components
│   │       ├── pages/              # Application pages/views
│   │       ├── hooks/              # Custom React hooks
│   │       ├── contexts/           # React contexts
│   │       └── App.tsx
│   │
│   ├── @opentegrate/desktop/       # Desktop app (Tauri)
│   │   └── src-tauri/              # Rust/Tauri code
│   │       └── src/                # Frontend (shares with web)
│   │
│   ├── @opentegrate/assistant/     # AI assistant engine
│   │   └── src/
│   │       ├── agent/              # Agent implementations
│   │       ├── tools/              # Tool definitions
│   │       ├── skills/             # Skills (from OpenClaw)
│   │       ├── messaging/          # Messaging channels
│   │       └── index.ts
│   │
│   ├── @opentegrate/editor/        # Code editor
│   │   └── src/
│   │       ├── panels/             # Editor panels
│   │       ├── language/           # Language support
│   │       ├── workspace/          # Workspace management
│   │       ├── completion/         # Code completion
│   │       └── index.ts
│   │
│   ├── @opentegrate/services/      # Shared services
│   │   └── src/
│   │       ├── llm/                # LLM provider management
│   │       ├── filesystem/         # File system operations
│   │       ├── search/             # Search & indexing
│   │       ├── network/            # HTTP, WebSocket clients
│   │       └── index.ts
│   │
│   └── @opentegrate/devkit/        # Developer tools
│       └── src/
│           ├── build/              # Build utilities
│           ├── test/               # Test helpers
│           ├── lint/               # Lint configs
│           └── docs/               # Documentation generation
│
├── scripts/
│   ├── build/                      # Build scripts
│   ├── migrate/                    # Migration utilities
│   ├── setup/                      # Setup/installation
│   └── release/                    # Release automation
│
├── docs/                           # Documentation
├── tests/                          # Integration tests
├── fixtures/                       # Test fixtures
├── .github/                        # GitHub workflows
├── package.json                    # Root package.json (workspace)
├── pnpm-workspace.yaml             # pnpm workspaces
├── turborepo.json                  # Turbo build config
├── tsconfig.json                   # Base TS config
├── .eslintrc.js                   # ESLint config
├── .prettierrc                    # Prettier config
└── Makefile                       # Common tasks
```

### Build Configuration

```json
// package.json (root)
{
  "name": "opentegrate",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules dist",
    "package": "scripts/package.sh"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run test:e2e
```

## Security Considerations

### Sandboxing

```typescript
// Plugin sandbox using Node.js worker threads or Web Workers
class PluginSandbox {
  private worker: Worker;
  
  async execute(plugin: PluginManifest, fn: string, args: unknown[]) {
    // Load plugin in isolated context
    // No direct access to host APIs
    // Communication via message passing
    // Resource limits enforced
  }
}
```

### Permission Model

```typescript
enum Permission {
  // File system
  FileRead = 'file:read',
  FileWrite = 'file:write',
  FileDelete = 'file:delete',
  
  // Network
  NetworkRequest = 'network:request',
  NetworkListen = 'network:listen',
  
  // System
  Execute = 'system:execute',
  SpawnProcess = 'system:spawn',
  
  // User data
  AccessConfig = 'config:access',
  AccessSecrets = 'secrets:access',
  
  // Other plugins
  CallPlugin = 'plugin:call',
}

class PermissionManager {
  check(pluginId: string, permission: Permission, resource?: string): boolean {
    // Check manifest permissions
    // Check user approval
    // Check system policy
    // Apply principle of least privilege
  }
}
```

## Performance Considerations

### Boot Time Optimization

```typescript
class BootManager {
  async boot(mode: BootMode = 'normal'): Promise<BootResult> {
    const profile = await this.loadProfile(mode);
    
    // Lazy load heavy modules
    this.lazyLoadThreshold = profile.lazyThreshold ?? 100;
    
    // Parallel initialization where safe
    await Promise.all([
      this.initStorage(),
      this.initEventBus(),
      this.initConfig(),
    ]);
    
    // Load plugins lazily based on mode
    await this.loadPlugins(profile.pluginAllowlist);
    
    // Start background services
    this.startBackgroundServices();
    
    return { success: true };
  }
}
```

### Memory Management

```typescript
class MemoryManager {
  private caches: LruCache<string, unknown>[] = [];
  private pool: ResourcePool;
  
  setMemoryLimit(bytes: number) {
    // Set global memory limit
    // Configure caches accordingly
    // Enable GC pressure monitoring
  }
  
  async withCache<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    // Check cache first
    const cached = this.getFromCache(key);
    if (cached) return cached;
    
    // Compute result
    const result = await fn();
    
    // Store in cache if under memory pressure
    if (this.underMemoryPressure()) {
      this.setInCache(key, result, ttl);
    }
    
    return result;
  }
}
```

## Testing Strategy

### Unit Tests
- Each package has its own `*.test.ts` files
- Run with Bun's built-in test runner or Vitest
- Stub external dependencies heavily
- Target >80% coverage

### Integration Tests
- End-to-end workflows across packages
- Use real temporary databases
- Test command execution, file operations, agent interactions

### Contract Tests
- Plugin SDK contract tests (ensure SDK backwards compatibility)
- Storage engine contract tests (ensure any IStorageEngine works)
- LLM provider contract tests (ensure provider implementations conform)

### Performance Tests
- Boot time benchmarks
- Command execution latency
- Memory usage under load
- Concurrent operation throughput

## Monitoring & Observability

```typescript
class Telemetry {
  private metrics: Metric[] = [];
  private traces: Trace[] = [];
  private logs: LogEntry[] = [];
  
  measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.metrics.push({
        name,
        duration: Date.now() - start,
        success: true,
      });
      return result;
    } catch (error) {
      this.metrics.push({
        name,
        duration: Date.now() - start,
        success: false,
        error: error.message,
      });
      throw error;
    }
  }
  
  trace(event: string, properties?: Record<string, unknown>) {
    this.traces.push({
      event,
      timestamp: Date.now(),
      properties,
    });
  }
}
```

## Documentation Plan

### API Documentation
- Use TypeDoc for generating API docs
- Document all public interfaces
- Include examples for each package

### User Guides
- Getting Started (terminal & GUI)
- Developer Guide (plugin creation)
- Administration Guide (deployment, security)
- Troubleshooting

### Internal Documentation
- Architecture diagrams (C4 model)
- Decision records (ADRs)
- Contributing guide
- Codebase tour

## Release Strategy

### Versioning
- Monorepo with independent package versions
- Semantic versioning per package
- Canary releases for testing
- Stable releases tagged in git

### Distribution
- npm packages (for programmatic use)
- Standalone binaries (for CLI)
- Desktop installers (macOS DMG, Windows MSI, Linux AppImage)
- Mobile apps (TestFlight, Play Store)
- Docker images (for server deployments)

## Success Criteria

1. **Functionality**: All features from both systems work correctly
2. **Performance**: Boot time <3s, command execution <100ms typical
3. **Usability**: New users productive within 10 minutes
4. **Extensibility**: Third-party plugins can target either original system
5. **Maintainability**: Clear separation of concerns, testable code
6. **Documentation**: Comprehensive docs for users and developers
7. **Migration**: Existing OpenCode and OpenClaw users can migrate smoothly

This architecture provides a solid foundation for the Opentegrate AI OS, combining the best of both worlds while maintaining clean separation of concerns and future extensibility.