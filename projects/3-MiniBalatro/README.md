# Mini Balatro

A web-based card game inspired by Balatro that combines poker mechanics with roguelike elements.

## Features

- 🃏 Strategic poker hand gameplay
- 🎮 Roguelike progression with increasing difficulty
- 🌟 Special cards: Jokers, Planets, and Tarots
- 🏪 Shop system for purchasing upgrades
- 💾 Game state persistence
- 📊 Detailed score breakdown

## Tech Stack

- **Language:** TypeScript
- **UI Framework:** React
- **Build Tool:** Vite
- **Testing:** Jest + TS-Jest
- **Documentation:** TypeDoc
- **Linting:** ESLint (Google Style Guide)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd mini-balatro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run docs` - Generate API documentation

## Project Structure
```
mini-balatro/
├── src/
│   ├── models/          # Game entities and logic
│   ├── controllers/     # Game flow orchestration
│   ├── services/        # Shop, persistence, config
│   ├── views/           # React UI components
│   └── utils/           # Utilities and constants
├── tests/               # Unit and integration tests
├── docs/                # Documentation
└── public/              # Static assets
```

## Architecture

The project follows a **Layered Architecture** with MVC pattern:

- **Model Layer:** Core game entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence)

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architectural decisions.

## Testing

The project maintains ≥75% code coverage:
```bash
npm run test:coverage
```

## Contributing

1. Follow the Google TypeScript Style Guide
2. Maintain test coverage ≥75%
3. Document all public APIs
4. Run linter before committing

## License

MIT