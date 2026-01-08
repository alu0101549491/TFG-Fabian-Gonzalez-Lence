# Music Web Player

An interactive music player web application built with React, TypeScript, and Vite. Features intuitive song playback, local playlist management, and displays complete information for each track.

## 🎵 Features

- Play/pause, next, and previous controls
- Progress bar with seek functionality
- Playlist management (add/remove songs)
- Track information display (title, artist, cover art)
- localStorage persistence for playlists
- Responsive design (desktop and mobile)
- Audio format validation
- Error handling for playback issues

## 🏗️ Architecture

This project follows **Component-Based Architecture with Custom Hooks**:

- **Components**: Presentation and container components following React best practices
- **Custom Hooks**: Reusable stateful logic encapsulation (useAudioPlayer, usePlaylist, useLocalStorage)
- **Utilities**: Helper functions for formatting, validation, and error handling
- **Types**: TypeScript interfaces and enums for type safety

### Design Patterns

- **Component-Based Pattern**: Separation between presentational and container components
- **Custom Hooks Pattern**: Encapsulation of reusable stateful logic
- **Composite Pattern**: Player component composes multiple child components
- **Observer Pattern**: React's state management for UI updates
- **Facade Pattern**: Hooks simplify browser API interactions

## 🛠️ Technology Stack

- **React 18**: UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **ESLint**: Code linting (Google Style Guide)
- **TypeDoc**: API documentation generation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🚀 Setup Instructions

### 1. Navigate to project directory
```bash
cd 2-MusicWebPlayer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for production
```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### 5. Preview production build
```bash
npm run preview
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

Coverage reports will be available in the `coverage/` directory.

## 📝 Code Quality

### Run linter
```bash
npm run lint
```

### Fix linting issues automatically
```bash
npm run lint:fix
```

### Type checking
```bash
npm run type-check
```

## 📚 Documentation

Generate API documentation:
```bash
npm run docs
```

Documentation will be available in `docs/api/index.html`

## 📁 Project Structure
```
2-MusicWebPlayer/
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── data/             # Data providers
│   ├── styles/           # CSS styles
│   ├── App.tsx           # Root component
│   └── main.tsx          # Application entry point
├── tests/                # Unit tests
├── docs/                 # Documentation
├── public/               # Static assets
└── index.html            # HTML entry point
```

## 🎯 Non-Functional Requirements

- **Code Coverage**: ≥80%
- **UI Performance**: < 100ms response time
- **Code Quality**: ESLint compliance with Google TypeScript Style Guide
- **Documentation**: Complete JSDoc/TypeDoc coverage
- **Responsiveness**: Works on desktop and mobile (min 320px viewport)
- **Accessibility**: Keyboard-accessible controls

## 👥 Author

- **Fabián González Lence**
- Universidad de La Laguna - Computer Engineering Degree
- Academic Year: 2025-2026

## 📄 License

MIT

## 🔗 Related Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Detailed architectural decisions
- [API Documentation](./docs/api/index.html) - Generated TypeDoc documentation