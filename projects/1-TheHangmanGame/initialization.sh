#!/bin/bash

# Initialize npm project (package.json already provided)
npm init -y

# Install production dependencies
npm install bulma

# Install development dependencies
npm install --save-dev \
  @eslint/js \
  @types/jest \
  @types/node \
  eslint \
  eslint-config-google \
  globals \
  jest \
  jest-environment-jsdom \
  ts-jest \
  ts-node \
  typedoc \
  typescript \
  typescript-eslint \
  vite

# Create necessary directories (not necessary)
# mkdir -p src/models src/views src/controllers src/styles
# mkdir -p tests/models tests/views tests/controllers
# mkdir -p tests/__mocks__
# mkdir -p docs
# mkdir -p public
# mkdir -p .github/workflows

# Create style mock for Jest
echo "module.exports = {};" > tests/__mocks__/styleMock.js

# Initialize Git (if not already in repository)
# Note: Since 1-TheHangmanGame is a subdirectory, 
# no need to initialize git here

# Verify installation
npm run type-check
# npm run lint

# Start development server
# npm test
npm run dev