# Khavee Chat

A full-stack TypeScript chat application built with Elysia.js and React, inspired by Character.ai.

## Features

- **Character Management**: Create, edit, and manage AI characters with personalities and backstories
- **Lorebook System**: Add detailed information to characters for richer interactions
- **Real-time Chat**: WebSocket-based streaming conversations with AI characters
- **Authentication**: Email/password and Google OAuth support
- **Public Characters**: Share and discover characters created by the community
- **Conversation History**: Persistent chat history with automatic summarization
- **Rate Limiting**: 5 AI responses per minute per user

## Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Elysia.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **AI**: Vercel AI SDK with OpenAI integration
- **Auth**: BetterAuth
- **Real-time**: WebSocket (native Bun WebSocket)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Bun
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router

## Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL database
- Redis server
- OpenAI API key

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd khavee-chat
```

2. Navigate to the backend directory:
```bash
cd backend
```

3. Install dependencies:
```bash
bun install
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/khavee_chat"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="your-super-secret-jwt-key"
AUTH_SECRET="your-super-secret-auth-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
OPENAI_API_KEY="your-openai-api-key"

# Server
PORT=3000
NODE_ENV="development"
```

5. Generate Prisma client:
```bash
bunx prisma generate
```

6. Run database migrations:
```bash
bunx prisma migrate dev
```

7. Start the development server:
```bash
bun run dev
```

The backend API will be available at `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

The frontend will be available at `http://localhost:5173` (or another port as specified).

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login user
- `POST /auth/signout` - Logout user
- `GET /auth/session` - Get current session
- `GET /auth/google` - Google OAuth

### Characters
- `GET /characters` - Get user's characters
- `GET /characters/public` - Get public characters
- `GET /characters/:id` - Get character details
- `POST /characters` - Create character
- `PUT /characters/:id` - Update character
- `DELETE /characters/:id` - Delete character

### Lorebook
- `GET /characters/:id/lorebook` - Get character lorebook
- `POST /characters/:id/lorebook` - Add lorebook entry
- `PUT /characters/:id/lorebook/:entryId` - Update lorebook entry
- `DELETE /characters/:id/lorebook/:entryId` - Delete lorebook entry

### Chat
- `GET /chat/conversations` - Get user conversations
- `GET /chat/conversations/:id` - Get conversation details
- `POST /chat/conversations` - Create conversation
- `POST /chat/message` - Send message

### WebSocket
- `WS /chat` - Real-time chat connection

## Database Schema

### Users
- `id` (UUID) - Primary key
- `email` (String) - Unique email address
- `password` (String) - Hashed password (optional for OAuth)
- `createdAt`, `updatedAt` - Timestamps

### Characters
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to users
- `fullname` (String) - Character's full name
- `nickname` (String) - Character's short name
- `personality` (Text) - Personality description
- `lore` (Text) - Background story
- `greeting` (Text) - First message
- `visibility` (Enum) - PUBLIC or PRIVATE
- `createdAt`, `updatedAt` - Timestamps

### Lorebook Entries
- `id` (UUID) - Primary key
- `characterId` (UUID) - Foreign key to characters
- `key` (String) - Entry identifier
- `value` (Text) - Entry content
- `createdAt`, `updatedAt` - Timestamps

### Conversations
- `id` (UUID) - Primary key
- `characterId` (UUID) - Foreign key to characters
- `userId` (UUID) - Foreign key to users
- `summary` (Text) - Conversation summary
- `createdAt`, `updatedAt` - Timestamps

### Messages
- `id` (UUID) - Primary key
- `conversationId` (UUID) - Foreign key to conversations
- `role` (Enum) - USER or ASSISTANT
- `content` (Text) - Message content
- `createdAt` - Timestamp

## Rate Limiting

- 5 AI responses per minute per user
- Implemented using Redis sorted sets
- Automatic cleanup of old entries

## Context Management

- Maintains last 10 messages in active context
- Automatically summarizes conversation every 10 messages
- Includes character lorebook in AI prompts
- Preserves conversation continuity

## Development

### Scripts

Backend:
```bash
bun install          # Install dependencies
bun run dev          # Start development server
bun src/index.ts     # Run production server
bunx prisma studio   # Open database browser
bunx prisma migrate dev  # Run migrations
```

Frontend:
```bash
bun install          # Install dependencies
bun dev              # Start development server
bun run build        # Build for production
bun start            # Run production server
```

### Project Structure

```
khavee-chat/
├── backend/
│   ├── src/
│   │   ├── lib/          # Utilities (prisma, redis, auth)
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (AI, chat, rate limiting)
│   │   ├── middleware/   # Elysia middleware
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Server entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities (API, auth)
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # App entry point
│   └── components.json   # shadcn/ui config
└── docs/
    └── plans/           # Implementation plans
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.