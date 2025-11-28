# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**Evalia** is a personal home avatar assistant built with KhaveeAI SDK - our internally developed SDK for VRM avatar integration with AI capabilities. This is a **single-user homelab system** designed for closed network use only.

## Technology Stack

### Frontend (Bun + Vite + React + TailwindCSS)
- **Runtime**: Bun (mandatory - not npm/yarn)
- **Build Tool**: Vite
- **Framework**: React 19 with TypeScript
- **Styling**: TailwindCSS
- **Avatar SDK**: KhaveeAI React SDK (@khaveeai/react, @khaveeai/core)
- **3D Rendering**: Three.js with @react-three/fiber, @react-three/drei
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend (Bun + ElysiaJS)
- **Runtime**: Bun (mandatory - not npm/yarn)
- **Framework**: ElysiaJS
- **Database**: Simple SQLite (no PostgreSQL needed)
- **AI**: KhaveeAI Providers (OpenAI, Azure, Mock)
- **Real-time**: Bun WebSockets
- **Storage**: Local file system (no Redis needed)

## Core: KhaveeAI SDK Integration

### Required Dependencies
```bash
# Core 3D libraries
bun add three @react-three/fiber @react-three/drei

# KhaveeAI SDK
bun add @khaveeai/react @khaveeai/core

# LLM/TTS Providers
bun add @khaveeai/providers-openai @khaveeai/providers-mock
```

### Basic Usage Pattern
```tsx
import { Canvas } from '@react-three/fiber';
import { KhaveeProvider, VRMAvatar } from '@khaveeai/react';

function App() {
  return (
    <KhaveeProvider config={config}>
      <Canvas>
        <VRMAvatar src="/models/avatar.vrm" animations={animations} />
      </Canvas>
    </KhaveeProvider>
  );
}
```

### Key KhaveeAI Features
- **30+ Facial Expressions**: Smooth expression transitions
- **Mixamo Animations**: URL-based animation loading
- **LLM Integration**: Built-in chat streaming
- **Text-to-Speech**: Voice synthesis with expression sync
- **TypeScript**: Full type safety

## Development Commands

### Seamless Developer Experience (Root Level)
```bash
# Install dependencies for both frontend and backend
bun install

# Start both frontend and backend in parallel
bun run dev

# Start individual services
bun run dev:frontend    # Port 5173
bun run dev:backend     # Port 3000

# Build all projects
bun run build

# Lint all projects
bun run lint

# Type check all projects
bun run type-check
```

### Nx Commands (Alternative)
```bash
# Using Nx directly with Bun
bunx nx run-many --target=dev --all
bunx nx run-many --target=build --all
bunx nx run-many --target=lint --all

# Project-specific commands
bunx nx run frontend:dev
bunx nx run backend:dev
bunx nx show projects
bunx nx graph
```

### Environment Setup
```bash
# One-time setup
bun install              # Install all dependencies
cd backend && bunx prisma generate
cd backend && bunx prisma migrate dev
```

### Database Commands
```bash
cd backend
bunx prisma studio      # Database browser
bunx prisma migrate dev  # Run migrations
bunx prisma generate     # Generate types
```

## Architecture Overview

### Simplified System Design
- **Single User**: No authentication, sessions, or user management
- **Local Storage**: SQLite database, local file system
- **Direct Access**: WebSocket communication without auth layers
- **Homelab Focus**: Optimized for local network performance

### Avatar System (KhaveeAI SDK)
- **VRM Loading**: Three.js-based VRM model rendering
- **Expression Control**: 30+ blendshapes with smooth transitions
- **Animation System**: Mixamo FBX animation support
- **Voice Integration**: TTS with lip-sync and expression mapping

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── avatar/          # KhaveeAI VRM components
│   │   ├── ui/              # Reusable UI components
│   │   └── chat/            # Chat interface components
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state management
│   ├── services/            # API and external services
│   └── utils/               # Utility functions
├── public/
│   ├── models/              # VRM avatar files
│   └── animations/          # Mixamo FBX animations
└── package.json
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   ├── websocket/           # WebSocket handlers
│   ├── lib/                 # Utilities (prisma)
│   └── types/               # TypeScript definitions
├── prisma/                  # SQLite database schema
└── package.json
```

## KhaveeAI SDK Patterns

### Expression Control
```tsx
import { useVRMExpressions } from '@khaveeai/react';

const { setExpression, setMultipleExpressions } = useVRMExpressions();

// Single expression
setExpression('happy', 1);

// Multiple expressions
setMultipleExpressions({
  happy: 0.8,
  surprised: 0.4
});
```

### Animation Control
```tsx
import { useVRMAnimations } from '@khaveeai/react';

const { animate, stopAnimation } = useVRMAnimations();

animate('walk');      // Play Mixamo animation
stopAnimation();      // Stop all animations
```

### LLM Integration
```tsx
import { useLLM } from '@khaveeai/react';
import { OpenAIProvider } from '@khaveeai/providers-openai';

const { streamChat } = useLLM();

for await (const chunk of streamChat({ messages })) {
  if (chunk.type === 'text') {
    console.log(chunk.delta);
  }
}
```

### Voice Synthesis
```tsx
import { useVoice } from '@khaveeai/react';

const { speak, speaking } = useVoice();

await speak({ text: 'Hello!', voice: 'female' });
```

## Asset Management

### VRM Models
- **Location**: `/public/models/`
- **Format**: VRM 1.0 or 0.x
- **Sources**: VRoid Hub, VRoid Studio, custom models
- **Current Asset**: EVA.vrm in `/public/EVA/`

### Animations
- **Location**: `/public/animations/`
- **Format**: Mixamo FBX (without skin)
- **Loading**: URL-based, no complex setup
- **Auto-Remapping**: Works out of the box with VRM

## Dependencies & Requirements

### Bun Runtime (Mandatory)
- **Package Manager**: Strictly Bun (no npm/yarn)
- **Runtime**: Both frontend and backend require Bun
- **Installation**: `curl -fsSL https://bun.sh/install | bash`

### Simplified Stack
- **Database**: SQLite (local, no PostgreSQL)
- **Storage**: Local file system (no Redis)
- **Authentication**: None required
- **Network**: Local homelab only

### KhaveeAI SDK Packages
- `@khaveeai/react`: React components and hooks
- `@khaveeai/core`: Core SDK functionality
- `@khaveeai/providers-openai`: OpenAI integration
- `@khaveeai/providers-mock`: Development testing

## Development Guidelines

### Functionality First
1. **No Authentication**: Direct system access
2. **Local Storage**: Simple file-based storage
3. **Single User**: Optimize for one user experience
4. **Performance**: Focus on responsiveness

### Avatar Development
1. **Expression Mapping**: Use KhaveeAI's built-in expressions
2. **Animation Loading**: Use Mixamo FBX URLs
3. **Voice Sync**: Leverage built-in expression-voice synchronization
4. **LLM Integration**: Use KhaveeAI providers

### Common Patterns
- **Direct Avatar Control**: No user permission layers
- **Local Configuration**: File-based settings
- **Home Automation**: Direct device integration
- **Task Management**: Simple local data storage

## Simplified Database Schema

### Core Tables (SQLite)
```sql
-- Avatar configurations
CREATE TABLE avatar_configs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  vrm_path TEXT NOT NULL,
  expressions TEXT, -- JSON
  animations TEXT,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conversation history
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  messages TEXT, -- JSON array
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Home automation devices
CREATE TABLE devices (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT, -- JSON
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks and reminders
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Functional Implementation Phases

### Phase 1: Character Rendering
- ✅ **Setup**: KhaveeAI SDK with Three.js
- ✅ **VRM Loading**: Display avatar from `/public/models/eva.vrm`
- ✅ **Basic Scene**: Lighting and camera controls

### Phase 2: Speech Input
- ✅ **Voice Recognition**: Web Speech API integration
- ✅ **Text Fallback**: Input field for non-voice input
- ✅ **Transcription**: Convert speech to text for processing

### Phase 3: Voice Response
- ✅ **Text-to-Speech**: KhaveeAI voice synthesis
- ✅ **Expression Sync**: Talking expressions during speech
- ✅ **Response Processing**: Handle conversation flow

### Phase 4: Expression & Animation System
- ✅ **Facial Expressions**: 30+ expressions via KhaveeAI SDK
- ✅ **Body Animations**: Mixamo FBX animations
- ✅ **Emotion Mapping**: Context-aware expression changes

### Phase 5: Tool Calling & Smart Home
- ✅ **LLM Tool Integration**: Function calling capabilities
- ✅ **Mock Device Control**: Light and thermostat control
- ✅ **Natural Commands**: "Turn on lights", "Set temperature to 72°"

## Current Implementation Status

### Completed
- Bun + Vite + React + ElysiaJS foundation
- KhaveeAI SDK dependencies installed
- Authentication removed for single-user setup
- Simplified SQLite database schema

### Ready to Implement
- VRM avatar rendering with KhaveeAI
- Voice input/output systems
- Expression and animation controls
- LLM tool calling for device control

### Required Assets
- **VRM Model**: EVA.vrm (move to `/public/models/`)
- **Animations**: Mixamo FBX files (idle, talk, wave, dance, walk)
- **Audio**: TTS configuration (OpenAI provider)