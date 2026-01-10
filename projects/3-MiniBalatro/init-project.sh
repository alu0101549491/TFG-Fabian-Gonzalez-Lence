#!/bin/bash

# Mini Balatro - Project Structure Initialization Script
# This script creates the complete directory structure and empty files

echo "🎮 Initializing Mini Balatro project structure..."

# Create root directories
echo "📁 Creating root directories..."
mkdir -p docs/diagrams
mkdir -p public/assets/{images,styles}
mkdir -p src
mkdir -p tests

# Create source directories
echo "📁 Creating source directories..."
mkdir -p src/models/core
mkdir -p src/models/poker
mkdir -p src/models/special-cards/jokers
mkdir -p src/models/special-cards/planets
mkdir -p src/models/special-cards/tarots
mkdir -p src/models/scoring
mkdir -p src/models/blinds
mkdir -p src/models/game
mkdir -p src/controllers
mkdir -p src/services/shop
mkdir -p src/services/persistence
mkdir -p src/services/config
mkdir -p src/views/components/game-board
mkdir -p src/views/components/hand
mkdir -p src/views/components/card
mkdir -p src/views/components/joker-zone
mkdir -p src/views/components/tarot-zone
mkdir -p src/views/components/shop
mkdir -p src/views/components/score-display
mkdir -p src/views/components/menu
mkdir -p src/utils
mkdir -p src/types

# Create test directories
echo "📁 Creating test directories..."
mkdir -p tests/unit/models/core
mkdir -p tests/unit/models/poker
mkdir -p tests/unit/models/special-cards/jokers
mkdir -p tests/unit/models/special-cards/planets
mkdir -p tests/unit/models/special-cards/tarots
mkdir -p tests/unit/models/scoring
mkdir -p tests/unit/models/blinds
mkdir -p tests/unit/controllers
mkdir -p tests/unit/services/shop
mkdir -p tests/unit/services/persistence
mkdir -p tests/integration

# Create configuration files
echo "📄 Creating configuration files..."
touch .gitignore
touch package.json
touch tsconfig.json
touch jest.config.js
touch jest.setup.js
touch vite.config.ts
touch eslint.config.mjs
touch typedoc.json
touch README.md
touch ARCHITECTURE.md

# Create documentation files
echo "📄 Creating documentation files..."
touch docs/diagrams/class-diagram.md
touch docs/diagrams/use-case-diagram.md

# Create public files
echo "📄 Creating public files..."
touch public/index.html

# Create main source files
echo "📄 Creating main source files..."
touch src/index.ts
touch src/main.tsx
touch src/index.css

# Create model files - core
echo "📄 Creating model files (core)..."
touch src/models/core/card.ts
touch src/models/core/card-value.enum.ts
touch src/models/core/suit.enum.ts
touch src/models/core/deck.ts
touch src/models/core/index.ts

# Create model files - poker
echo "📄 Creating model files (poker)..."
touch src/models/poker/hand-evaluator.ts
touch src/models/poker/hand-result.ts
touch src/models/poker/hand-type.enum.ts
touch src/models/poker/hand-upgrade.ts
touch src/models/poker/hand-upgrade-manager.ts
touch src/models/poker/index.ts

# Create model files - special cards (jokers)
echo "📄 Creating model files (jokers)..."
touch src/models/special-cards/jokers/joker.ts
touch src/models/special-cards/jokers/joker-priority.enum.ts
touch src/models/special-cards/jokers/chip-joker.ts
touch src/models/special-cards/jokers/mult-joker.ts
touch src/models/special-cards/jokers/multiplier-joker.ts
touch src/models/special-cards/jokers/index.ts

# Create model files - special cards (planets)
echo "📄 Creating model files (planets)..."
touch src/models/special-cards/planets/planet.ts
touch src/models/special-cards/planets/index.ts

# Create model files - special cards (tarots)
echo "📄 Creating model files (tarots)..."
touch src/models/special-cards/tarots/tarot.ts
touch src/models/special-cards/tarots/tarot-effect.enum.ts
touch src/models/special-cards/tarots/instant-tarot.ts
touch src/models/special-cards/tarots/targeted-tarot.ts
touch src/models/special-cards/tarots/index.ts

# Create model files - scoring
echo "📄 Creating model files (scoring)..."
touch src/models/scoring/score-calculator.ts
touch src/models/scoring/score-context.ts
touch src/models/scoring/score-result.ts
touch src/models/scoring/score-breakdown.ts
touch src/models/scoring/index.ts

# Create model files - blinds
echo "📄 Creating model files (blinds)..."
touch src/models/blinds/blind.ts
touch src/models/blinds/small-blind.ts
touch src/models/blinds/big-blind.ts
touch src/models/blinds/boss-blind.ts
touch src/models/blinds/boss-type.enum.ts
touch src/models/blinds/blind-modifier.ts
touch src/models/blinds/blind-generator.ts
touch src/models/blinds/index.ts

# Create model files - game
echo "📄 Creating model files (game)..."
touch src/models/game/game-state.ts
touch src/models/game/index.ts

# Create model index
touch src/models/index.ts

# Create controller files
echo "📄 Creating controller files..."
touch src/controllers/game-controller.ts
touch src/controllers/index.ts

# Create service files - shop
echo "📄 Creating service files (shop)..."
touch src/services/shop/shop.ts
touch src/services/shop/shop-item.ts
touch src/services/shop/shop-item-type.enum.ts
touch src/services/shop/shop-item-generator.ts
touch src/services/shop/index.ts

# Create service files - persistence
echo "📄 Creating service files (persistence)..."
touch src/services/persistence/game-persistence.ts
touch src/services/persistence/index.ts

# Create service files - config
echo "📄 Creating service files (config)..."
touch src/services/config/game-config.ts
touch src/services/config/balancing-config.ts
touch src/services/config/index.ts

# Create service index
touch src/services/index.ts

# Create view files - App
echo "📄 Creating view files..."
touch src/views/App.tsx

# Create view components - game-board
echo "📄 Creating view components (game-board)..."
touch src/views/components/game-board/GameBoard.tsx
touch src/views/components/game-board/GameBoard.css
touch src/views/components/game-board/index.ts

# Create view components - hand
echo "📄 Creating view components (hand)..."
touch src/views/components/hand/Hand.tsx
touch src/views/components/hand/Hand.css
touch src/views/components/hand/index.ts

# Create view components - card
echo "📄 Creating view components (card)..."
touch src/views/components/card/CardComponent.tsx
touch src/views/components/card/CardComponent.css
touch src/views/components/card/index.ts

# Create view components - joker-zone
echo "📄 Creating view components (joker-zone)..."
touch src/views/components/joker-zone/JokerZone.tsx
touch src/views/components/joker-zone/JokerZone.css
touch src/views/components/joker-zone/index.ts

# Create view components - tarot-zone
echo "📄 Creating view components (tarot-zone)..."
touch src/views/components/tarot-zone/TarotZone.tsx
touch src/views/components/tarot-zone/TarotZone.css
touch src/views/components/tarot-zone/index.ts

# Create view components - shop
echo "📄 Creating view components (shop)..."
touch src/views/components/shop/ShopView.tsx
touch src/views/components/shop/ShopView.css
touch src/views/components/shop/index.ts

# Create view components - score-display
echo "📄 Creating view components (score-display)..."
touch src/views/components/score-display/ScoreDisplay.tsx
touch src/views/components/score-display/ScoreDisplay.css
touch src/views/components/score-display/index.ts

# Create view components - menu
echo "📄 Creating view components (menu)..."
touch src/views/components/menu/MainMenu.tsx
touch src/views/components/menu/MainMenu.css
touch src/views/components/menu/index.ts

# Create view indexes
touch src/views/components/index.ts
touch src/views/index.ts

# Create utils files
echo "📄 Creating utility files..."
touch src/utils/constants.ts
touch src/utils/index.ts

# Create types files
echo "📄 Creating type files..."
touch src/types/global.d.ts
touch src/types/index.ts

# Create test files - models (core)
echo "📄 Creating test files (models - core)..."
touch tests/unit/models/core/card.test.ts
touch tests/unit/models/core/deck.test.ts

# Create test files - models (poker)
echo "📄 Creating test files (models - poker)..."
touch tests/unit/models/poker/hand-evaluator.test.ts
touch tests/unit/models/poker/hand-upgrade-manager.test.ts

# Create test files - models (special cards)
echo "📄 Creating test files (models - special cards)..."
touch tests/unit/models/special-cards/jokers/joker.test.ts
touch tests/unit/models/special-cards/planets/planet.test.ts
touch tests/unit/models/special-cards/tarots/tarot.test.ts

# Create test files - models (scoring)
echo "📄 Creating test files (models - scoring)..."
touch tests/unit/models/scoring/score-calculator.test.ts

# Create test files - models (blinds)
echo "📄 Creating test files (models - blinds)..."
touch tests/unit/models/blinds/blind-generator.test.ts

# Create test files - controllers
echo "📄 Creating test files (controllers)..."
touch tests/unit/controllers/game-controller.test.ts

# Create test files - services
echo "📄 Creating test files (services)..."
touch tests/unit/services/shop/shop.test.ts
touch tests/unit/services/persistence/game-persistence.test.ts

# Create test files - integration
echo "📄 Creating test files (integration)..."
touch tests/integration/game-flow.test.ts

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📊 Summary:"
echo "   - Root configuration files: 9"
echo "   - Documentation files: 3"
echo "   - Source files: 80+"
echo "   - Test files: 13"
echo ""
echo "📝 Next steps:"
echo "   1. Copy content into configuration files"
echo "   2. Copy content into source files"
echo "   3. Run: npm install"
echo "   4. Run: npm run dev"
echo ""
echo "🎮 Happy coding!"