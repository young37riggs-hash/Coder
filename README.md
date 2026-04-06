# Opentegrate

> **OpenCode AI TUI based OS for And OpenClaw Functionality portal**

Opentegrate is a unified AI-powered development environment and personal assistant system that combines the best features of **OpenCode** (AI code editor) and **OpenClaw** (multi-channel AI assistant) into a single, cohesive system.

## ✨ Features

### Dual-Agent System
- **Coding Agent**: Specialized in code generation, debugging, refactoring, and project navigation (from OpenCode)
- **Chat Agent**: General-purpose AI assistant with 20+ messaging channel integrations (from OpenClaw)
- **Auto-Routing**: Automatically selects the appropriate agent based on your query context

### Unified Interface
- **Terminal/TUI**: Full-featured text UI with keyboard-driven navigation
- **Web GUI**: Modern React-based web interface
- **Desktop**: Tauri-powered native desktop applications
- **Mobile**: React Native mobile apps

### Smart Features
- **Context Awareness**: Knows your current file, project structure, and conversation history
- **Hybrid Mode**: Seamlessly combine coding and conversation in the same session
- **Plugin System**: Support for both OpenCode extensions and OpenClaw skills, all in one
- **Multi-Channel**: Connect to Telegram, WhatsApp, Discord, Slack, and more

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/opentegrate/opentegrate.git
cd opentegrate

# Install dependencies (requires Bun)
bun install

# Build the project
bun run build

# Start in terminal mode
bun run oct

# Or start the web interface
bun run dev:web
```

### First Run
```bash
# Interactive setup wizard
oct onboard

# Open a workspace (coding mode)
oct workspace open ~/projects/myproject

# Ask a coding question
oct ask "How do I implement a binary tree in TypeScript?"

# Or chat with the assistant
oct chat send "What's the weather like today?"

# Switch to hybrid mode
oct workspace set-mode hybrid
```

## 📁 Project Structure

```
opentegrate/
├── packages/
│   ├── @opentegrate/core/          # Shared types, config, events
│   ├── @opentegrate/cli/           # Terminal/TUI interface
│   ├── @opentegrate/web/           # Web application
│   ├── @opentegrate/desktop/       # Desktop app (Tauri)
│   ├── @opentegrate/assistant/     # AI agent engine
│   ├── @opentegrate/editor/        # Code editor components
│   ├── @opentegrate/services/      # LLM, storage, tools
│   └── @opentegrate/devkit/        # Developer tools
├── docs/                           # Documentation
├── scripts/                        # Build and utility scripts
├── tests/                          # Integration tests
└── fixtures/                       # Test fixtures
```

## 🔧 Commands

### General Commands
```bash
# Ask any question (auto-routes to correct agent)
oct ask "Refactor this function to be more efficient"

# Explicit coding mode
oct code complete index.ts --position 10:5

# Explicit chat mode
oct chat send "Tell me a joke about programming"

# Workspace management
oct workspace open ./myproject
oct workspace list
oct workspace info
```

### System Commands
```bash
# Check system status
oct system status --detailed

# View logs
oct system logs --follow --level debug

# Plugin management
oct plugin list
oct plugin install github.com/user/skill-notion
oct plugin enable skill-notion

# Health check
oct system health

# Configuration
oct system config show
oct system config set agents.default auto
```

### Development Commands
```bash
# Development server
oct dev server --port 3000 --hot

# Testing
oct dev test --watch --coverage

# Linting
oct dev lint --fix

# Build
oct dev build --minify --analyze

# Debug tools
oct dev debug trace <tool-id>
oct dev protocol trace
```

## 🧩 Plugin System

Opentegrate supports plugins from both OpenCode and OpenClaw ecosystems:

### Plugin Types
- **Skills** (from OpenClaw): Productivity and automation capabilities
- **Channels** (from OpenClaw): Messaging platform integrations
- **Providers** (from both): LLM and AI service integrations
- **Extensions** (from OpenCode): Editor enhancements

### Creating a Plugin
```bash
# Scaffold a new skill
oct plugin create my-awesome-skill --type skill --output ./plugins/

# Plugin structure
my-awesome-skill/
├── plugin.json           # Manifest (unified format)
├── src/
│   ├── index.ts          # Main plugin entry
│   └── api.ts            # Public API
├── package.json          # Dependencies
└── README.md             # Documentation
```

### Plugin Manifest
```json
{
  "id": "skill-myawesome",
  "name": "My Awesome Skill",
  "version": "1.0.0",
  "description": "Does awesome things",
  "targets": ["opentegrate"],
  "main": "dist/index.js",
  "capabilities": {
    "skills": [
      {
        "id": "do-awesome",
        "name": "Do Awesome Thing",
        "handler": "handleDoAwesome"
      }
    ]
  },
  "permissions": ["network:request", "file:read"]
}
```

## 🔌 Supported Integrations

### Messaging Channels (from OpenClaw)
- Telegram
- WhatsApp
- Discord
- Slack
- Signal
- iMessage
- IRC
- Microsoft Teams
- Matrix
- And many more...

### LLM Providers (from both)
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- Google (Gemini)
- Mistral AI
- Ollama (local models)
- Custom OpenAI-compatible APIs

### Skills (from OpenClaw)
- GitHub integration
- Notion sync
- Obsidian vaults
- Weather forecasts
- File operations
- Web search
- Image generation
- And 50+ more...

### Editor Features (from OpenCode)
- Code completion
- Inline suggestions
- Linting and diagnostics
- Git integration
- Terminal multiplexer
- Multi-cursor editing

## ⚙️ Configuration

Configuration follows a unified format supporting both simple JSON and robust SQLite storage:

```typescript
// ~/.opentegrate/config.json (or config.yaml)
{
  "version": 1,
  "app": {
    "name": "Opentegrate",
    "theme": "dark",
    "defaultMode": "auto"
  },
  "agents": {
    "default": "auto",
    "coding": {
      "enabled": true,
      "model": "gpt-4"
    },
    "chat": {
      "enabled": true,
      "model": "claude-3-opus"
    },
    "orchestration": {
      "autoRoute": true,
      "allowHybrid": false
    }
  },
  "providers": [
    {
      "id": "openai",
      "type": "openai",
      "auth": { "type": "api-key" },
      "models": ["gpt-4-turbo", "gpt-4"]
    }
  ],
  "channels": [
    {
      "id": "telegram",
      "enabled": true,
      "type": "telegram",
      "connection": { "token": "YOUR_TOKEN" }
    }
  ]
}
```

### Environment Variables
```bash
# LLM API keys
OPENTEGRATE_OPENAI_API_KEY=sk-...
OPENTEGRATE_ANTHROPIC_API_KEY=sk-...

# Gateway/Server
OPENTEGRATE_GATEWAY_URL=http://localhost:18789
OPENTEGRATE_GATEWAY_TOKEN=...

# Storage
OPENTEGRATE_DATA_DIR=~/.local/share/opentegrate
OPENTEGRATE_CONFIG_DIR=~/.config/opentegrate

# Development
OPENTEGRATE_DEBUG=true
OPENTEGRATE_LOG_LEVEL=debug
OPENTEGRATE_PROFILE=development
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interfaces                     │
│  ┌────────┐  ┌───────┐  ┌──────────┐         │
│  │  TUI   │  │  Web  │  │ Desktop  │         │
│  └────────┘  └───────┘  └──────────┘         │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│           Command Router                        │
│  Routes: ask → code | chat | hybrid            │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         Agent Orchestrator                      │
│  ┌─────────────┐  ┌─────────────┐            │
│  │ Coding Agent │  │ Chat Agent  │            │
│  └─────────────┘  └─────────────┘            │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│            Unified LLM Service                 │
│  ┌─────────────────────────────────────────┐  │
│  │  Provider Router (OpenAI, Anthropic)   │  │
│  └─────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         Storage Layer (SQLite + JSON)          │
└───────────────────────────────────────────────┘
```

### Agent Execution Flow
1. User input arrives via CLI, web, or channel
2. **AgentOrchestrator** classifies intent (coding vs chat)
3. Selected agent receives context-enhanced prompt
4. Agent may use tools (skills, file operations, etc.)
5. Response is formatted and delivered via appropriate channel
6. Conversation history is stored for context

## 🔒 Security

- **Plugin Sandboxing**: Plugins run in isolated Worker contexts
- **Permission System**: Granular permissions file system, network, execution
- **Secret Management**: Encrypted storage for API keys
- **Auth**: OAuth flows for provider authentication
- **Sandbox Mode**: Can run entirely offline with local models

## 🧪 Testing

```bash
# Unit tests
bun test

# E2E tests
bun run test:e2e

# With coverage
bun run test:coverage

# Specific package
bun test --cwd packages/assistant
```

## 📦 Building

```bash
# Build all packages
bun run build

# Build specific package
bun run build:cli

# Clean
bun run clean

# Type checking
bun run typecheck

# Linting
bun run lint --fix
```

## 📚 Documentation

- [Getting Started Guide](docs/getting-started.md)
- [Plugin Development](docs/plugins/overview.md)
- [Agent Architecture](docs/architecture/agents.md)
- [Storage Layer](docs/architecture/storage.md)
- [CLI Reference](docs/reference/cli.md)
- [API Documentation](docs/api/)

## 🔄 Migration

### From OpenCode
```bash
oct migrate opencode <path-to-opencode-config>
```

### From OpenClaw
```bash
oct migrate openclaw <path-to-openclaw-config>
```

Migration preserves:
- API keys and credentials
- Plugin configurations
- Workspace/project definitions
- Chat history (where applicable)

## 🧑‍💻 Development

### Prerequisites
- Node.js 20+
- Bun 1.1+
- Git

### Setup
```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Start development server
bun run dev
```

### Architecture Guidelines
- TypeScript strict mode
- Effect patterns for async/error handling
- Drizzle ORM for database operations
- Zod for schema validation
- Minimum surface area for public APIs

## 📄 License

MIT - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Opentegrate builds upon the incredible work of:
- **OpenCode**: AI-powered code editor with sophisticated tooling
- **OpenClaw**: Multi-channel AI assistant with extensive plugin ecosystem
- Both communities and contributors

---

**Opentegrate** - Where intelligent development meets intelligent assistance.