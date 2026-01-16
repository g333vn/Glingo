# Glingo - Japanese Learning Platform

A comprehensive web application for learning Japanese, featuring JLPT preparation, interactive lessons, quizzes, and a spaced repetition system (SRS) for effective memorization.

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, Ant Design 5 |
| **Backend** | Supabase (Auth, PostgreSQL, RLS, Real-time, Storage) |
| **Deployment** | Vercel (Analytics, Speed Insights) |
| **State Management** | React Context API |
| **Routing** | React Router v7 |
| **Storage** | IndexedDB (primary), localStorage (fallback), Supabase (cloud sync) |
| **Icons** | Lucide React, React Icons |
| **PWA** | vite-plugin-pwa |

## Features

### Learning Modules

- **Level System (N1-N5)**: Structured Japanese courses organized by JLPT level
  - Books → Chapters → Lessons → Quizzes
  - Rich content support (theory, flashcards, exercises)
  - Progress tracking per lesson

- **JLPT Exam Practice**: Real JLPT exam simulation
  - Knowledge section (vocabulary, grammar, reading)
  - Listening section with audio support
  - Automatic scoring and detailed results
  - Answer explanations

- **Dashboard**: Personal learning hub
  - Progress overview and statistics
  - SRS (Spaced Repetition System) flashcard reviews
  - Activity feed and streak tracking
  - Performance analytics

### User System

- **Authentication**: Supabase Auth with email/password
- **Roles**: Admin, Editor, User
- **Profile Management**: Display name, avatar, preferences
- **Access Control**: Per-level and per-module restrictions

### Admin Panel

- **Content Management**: CRUD for books, chapters, lessons, quizzes
- **Exam Management**: Create and manage JLPT practice exams
- **User Management**: View users, change roles, ban/unban
- **Access Control**: Configure level/module access
- **Settings**: Maintenance mode, system configuration
- **Notifications**: Send announcements to users

### Additional Features

- **JLPT Dictionary**: 8,292+ words with lookup
- **Google Translate Integration**: Quick translations
- **Global Search**: Find content across the platform
- **Multi-language UI**: Vietnamese, English, Japanese
- **Offline Support**: IndexedDB caching for offline access
- **Real-time Sync**: Access control updates in real-time

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Supabase account (for backend features)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd elearning

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin panel components
│   ├── api_translate/  # Dictionary & translation
│   ├── analytics/      # Charts and insights
│   └── ...
├── contexts/           # React Context providers
│   ├── AuthContext.jsx
│   └── LanguageContext.jsx
├── features/           # Feature-specific modules
│   ├── books/          # Level system (N1-N5)
│   └── jlpt/           # JLPT exam practice
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   └── editor/         # Editor pages
├── services/           # API & business logic
├── translations/       # i18n translations
├── utils/              # Utility functions
└── styles/             # Global styles
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run backup:auto` | Auto backup data |
| `npm run i18n:scan` | Scan for translation keys |
| `npm run verify:deploy` | Verify deployment |

## Documentation

See the [docs/](./docs/) folder for detailed documentation:

### Core Documentation
- [Architecture Overview](./docs/ARCHITECTURE.md) - System architecture, data flow, security
- [Features Guide](./docs/FEATURES.md) - Learning modules, SRS, admin features
- [Setup Guide](./docs/SETUP.md) - Installation, Supabase setup, deployment
- [API & Services](./docs/API_SERVICES.md) - Services reference, contexts, hooks

### Additional Guides
- [Database Documentation](./docs/DATABASE.md) - Schema, relationships, migrations
- [Deployment Guide](./docs/DEPLOYMENT.md) - Vercel setup, CI/CD, environment
- [Development Guide](./docs/DEVELOPMENT.md) - Development workflow, conventions
- [Security Guide](./docs/SECURITY.md) - Security best practices
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

## Security

- Supabase Row Level Security (RLS) for data protection
- Role-based access control (Admin/Editor/User)
- PKCE flow for OAuth
- Secure session management
- Password hashing via Supabase Auth

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check code style
4. Submit a pull request

## License

Private project - All rights reserved.
