# The Hangman Game

A responsive Single Page Application (SPA) implementing the classic Hangman game where players guess animal names letter by letter.

## 🎮 Features

- Interactive alphabet for letter selection
- Visual word progress with letter boxes
- Canvas-based hangman rendering
- Complete game state management
- Responsive design (desktop and mobile)
- Maximum 6 failed attempts
- Victory/defeat detection and messaging

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** architectural pattern:

- **Model**: Game logic, word dictionary, and state management
- **View**: UI components (word display, alphabet, hangman canvas, messages)
- **Controller**: Coordinates user interactions between Model and View

### Design Patterns

- **MVC Pattern**: Separation of concerns
- **Observer Pattern**: Event handling for user interactions
- **Composite Pattern**: View composition of multiple display components
- **Singleton Pattern**: Single word dictionary instance

## 🛠️ Technology Stack

- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Bulma**: CSS framework for styling
- **Canvas API**: Hangman drawing
- **Jest**: Unit testing framework
- **ESLint**: Code linting (Google Style Guide)
- **TypeDoc**: API documentation generation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
cd 1-TheHangmanGame
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
1-TheHangmanGame/
├── src/
│   ├── models/          # Business logic
│   ├── views/           # UI components
│   ├── controllers/     # Coordination logic
│   ├── styles/          # CSS styles
│   └── main.ts          # Application entry point
├── tests/               # Unit tests
├── docs/                # Documentation
├── public/              # Static assets
└── index.html           # HTML entry point
```

## 🎯 Non-Functional Requirements

- **Code Coverage**: ≥80%
- **UI Performance**: < 200ms response time
- **Code Quality**: ESLint compliance with Google TypeScript Style Guide
- **Documentation**: Complete JSDoc/TypeDoc coverage

## 👥 Author

- **Fabián González Lence**
- Universidad de La Laguna - Computer Engineering Degree
- Academic Year: 2025-2026

## 📄 License

MIT

## 🔗 Related Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Detailed architectural decisions
- [API Documentation](./docs/api/index.html) - Generated TypeDoc documentation