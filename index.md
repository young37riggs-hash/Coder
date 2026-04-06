# Opentegrate Documentation

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [CLI Reference](#cli-reference)
- [Plugin Development](#plugin-development)
- [API Reference](#api-reference)
- [Configuration](#configuration)

## Getting Started

See the [README.md](../README.md) for installation and quick start instructions.

## Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full system architecture.

## CLI Reference

The `oct` CLI provides the following command groups:

- `oct ask <prompt>` - Ask the AI assistant (auto-routes to coding or chat)
- `oct code <prompt>` - Direct coding assistant
- `oct chat <message>` - Direct chat assistant
- `oct workspace` - Workspace management
- `oct plugin` - Plugin management
- `oct system` - System administration
- `oct dev` - Development tools

## Plugin Development

Plugins follow the unified manifest format in `plugin.json`. See the example plugin in `example-plugins/greeting-skill/`.

## API Reference

### Core Types

All types are exported from `@opentegrate/core`:
- `UnifiedConfig` - Main configuration interface
- `IUnifiedAgent` - Agent interface
- `PluginManifest` - Plugin manifest format
- `EventBus` - Event system

### Services

Services are exported from `@opentegrate/services`:
- `LLMRouter` - Multi-provider LLM routing
- `OpenAIProvider` - OpenAI integration
- `AnthropicProvider` - Anthropic/Claude integration
- `OllamaProvider` - Local Ollama integration
- `HttpClient` - HTTP client with retry
- `WebSocketClient` - WebSocket client with reconnect

### Agent

Agents are exported from the `agent/` module:
- `CodingAgent` - Specialized coding assistant
- `ChatAgent` - General conversation assistant
- `AgentOrchestrator` - Intent routing between agents
- `AgentRegistry` - Agent registration and lookup

## Configuration

Configuration is stored in `~/.opentegrate/config.json` by default. See the README for full configuration options.
