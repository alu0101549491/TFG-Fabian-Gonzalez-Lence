# Mini Balatro — Project Structure

```
3-MiniBalatro/
├── src/
│   ├── controllers/
│   │   └── game-controller.ts
│   ├── models/
│   │   ├── core/
│   │   │   ├── card-value.enum.ts
│   │   │   ├── card.ts
│   │   │   ├── deck.ts
│   │   │   └── suit.enum.ts
│   │   ├── poker/
│   │   │   ├── hand-evaluator.ts
│   │   │   ├── hand-result.ts
│   │   │   ├── hand-type.enum.ts
│   │   │   ├── hand-upgrade-manager.ts
│   │   │   └── hand-upgrade.ts
│   │   ├── scoring/
│   │   │   ├── score-breakdown.ts
│   │   │   ├── score-calculator.ts
│   │   │   ├── score-context.ts
│   │   │   └── score-result.ts
│   │   ├── blinds/
│   │   │   ├── big-blind.ts
│   │   │   ├── blind-generator.ts
│   │   │   ├── blind-modifier.ts
│   │   │   ├── blind.ts
│   │   │   ├── boss-blind.ts
│   │   │   ├── boss-type.enum.ts
│   │   │   └── small-blind.ts
│   │   ├── game/
│   │   │   └── game-state.ts
│   │   └── special-cards/
│   │       ├── jokers/
│   │       │   ├── chip-joker.ts
│   │       │   ├── economic-joker.ts
│   │       │   ├── joker-priority.enum.ts
│   │       │   ├── joker.ts
│   │       │   ├── mult-joker.ts
│   │       │   ├── multiplier-joker.ts
│   │       │   └── permanent-upgrade-joker.ts
│   │       ├── planets/
│   │       │   └── planet.ts
│   │       └── tarots/
│   │           ├── instant-tarot.ts
│   │           ├── targeted-tarot.ts
│   │           ├── tarot-effect.enum.ts
│   │           └── tarot.ts
│   ├── services/
│   │   ├── config/
│   │   │   ├── balancing-config.ts
│   │   │   ├── game-config.ts
│   │   │   └── types.ts
│   │   ├── persistence/
│   │   │   └── game-persistence.ts
│   │   └── shop/
│   │       ├── shop-item-generator.ts
│   │       ├── shop-item-type.enum.ts
│   │       ├── shop-item.ts
│   │       └── shop.ts
│   ├── types/
│   │   └── global.d.ts
│   ├── utils/
│   │   ├── apply-theme.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── views/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── components/
│   │       ├── card/
│   │       │   ├── CardComponent.tsx
│   │       │   └── CardComponent.css
│   │       ├── game-board/
│   │       │   ├── GameBoard.tsx
│   │       │   └── GameBoard.css
│   │       ├── hand/
│   │       │   ├── Hand.tsx
│   │       │   └── Hand.css
│   │       ├── hand-info-panel/
│   │       │   ├── HandInfoPanel.tsx
│   │       │   └── HandInfoPanel.css
│   │       ├── joker-zone/
│   │       │   ├── JokerZone.tsx
│   │       │   └── JokerZone.css
│   │       ├── menu/
│   │       │   ├── MainMenu.tsx
│   │       │   └── MainMenu.css
│   │       ├── modals/
│   │       │   ├── BlindDefeatModal.tsx
│   │       │   ├── BlindDefeatModal.css
│   │       │   ├── BlindVictoryModal.tsx
│   │       │   ├── BlindVictoryModal.css
│   │       │   ├── GameVictoryModal.tsx
│   │       │   ├── GameVictoryModal.css
│   │       │   ├── HelpModal.tsx
│   │       │   └── HelpModal.css
│   │       ├── score-display/
│   │       │   ├── ScoreDisplay.tsx
│   │       │   └── ScoreDisplay.css
│   │       ├── shop/
│   │       │   ├── ShopView.tsx
│   │       │   └── ShopView.css
│   │       ├── tarot-zone/
│   │       │   ├── TarotZone.tsx
│   │       │   └── TarotZone.css
│   │       └── tooltip/
│   │           ├── Tooltip.tsx
│   │           └── Tooltip.css
│   ├── index.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── integration/
│   │   └── game-flow.test.ts
│   └── unit/
│       ├── controllers/
│       │   └── game-controller.test.ts
│       ├── models/
│       │   ├── blinds.test.ts
│       │   ├── core.test.ts
│       │   ├── game-state.test.ts
│       │   ├── jokers.test.ts
│       │   ├── planets.test.ts
│       │   ├── poker.test.ts
│       │   ├── scoring.test.ts
│       │   └── tarots.test.ts
│       ├── services/
│       │   ├── config.test.ts
│       │   ├── game-persistence.test.ts
│       │   └── shop.test.ts
│       └── utils/
│           ├── constants.test.ts
│           └── helpers.test.ts
├── public/
│   ├── data/
│   │   ├── hand-values.json
│   │   ├── jokers.json
│   │   ├── planets.json
│   │   └── tarots.json
│   └── favicon.ico
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── jest.config.js
```
