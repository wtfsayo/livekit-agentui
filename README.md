# LiveKit Agent UI

A voice-first chat application with Google Meet-style onboarding, built with Vite React frontend and Express backend.

## Features

- 🎙️ **Voice-First Design**: Optimized for voice interactions with real-time audio visualization
- 🚀 **Google Meet-Style Onboarding**: Streamlined 2-step setup (name + audio testing)
- 🔊 **Live Audio Testing**: Real microphone testing during device selection
- 🎨 **Modern UI**: Clean shadcn/ui components with light theme
- ⚡ **Fast Development**: Vite for frontend, Express for backend
- 🔗 **LiveKit Integration**: Production-ready real-time voice communication

## Architecture

```
/
├── frontend/              # Vite React app (port 5173)
│   ├── src/components/    # React components
│   └── package.json       # Frontend dependencies
├── backend/               # Express server (port 3001)
│   ├── src/routes/        # API routes
│   └── package.json       # Backend dependencies
└── package.json           # Root scripts
```

## Quick Start

1. **Install dependencies:**
   ```bash
   bun install:all
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Add your LiveKit credentials to .env
   ```

3. **Start both servers:**
   ```bash
   bun start
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Environment Variables

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here

# Backend Configuration
PORT=3001

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001
```

## Scripts

- `bun start` - Start both frontend and backend
- `bun dev` - Start both in development mode with hot reload
- `bun build` - Build frontend for production
- `bun install:all` - Install all dependencies
- `bun clean` - Clean all node_modules

## Components

### Core Components
- **VoiceOnboarding**: Google Meet-style guided setup
- **VoiceChatRoom**: Main voice chat interface
- **AudioVisualizer**: Real-time audio waveform visualization
- **AgentStatusIndicator**: Connection status and agent state

### UI Components
Complete shadcn/ui component library with 25+ accessible components.

## API Routes

- `POST /api/livekit-token` - Generate LiveKit JWT tokens
- `GET /api/health` - Health check and LiveKit configuration status

## Development

The application uses:
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript + LiveKit Server SDK
- **Build Tool**: Bun for fast package management and execution

## Production Ready

✅ 100% production-ready with:
- Real LiveKit integration (no simulations)
- Comprehensive error handling
- TypeScript throughout
- Responsive design
- Accessibility compliance