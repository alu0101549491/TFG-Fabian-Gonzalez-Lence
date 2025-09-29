# Gemini Capability Testing

The purpose of this section is to provide a simple example of a web application done with the AI model of Gemini to see how well it performs making a whole web application from scratch by itself.

## Setup

**Prompt used:**

```
We will need to setup the environment where we will be working, so for instance I need you to tell me how to install all the things we need for the base of the project, as a guide, I'll tell you the technologies I'd like to use:

- npm
- typescript
- vite
- eslint
- jest
```

The LLM first suggested checking the installation of node (`node -v`) and npm (`npm -v`), and then initializing the project with vite using the command `npm create vite@latest`. Vite requested basic information, such as the project name, the framework, whether Typescript is used, etc. Once the project was successfully created, it suggested installing eslint with certain plugins that the model deemed optimal, as well as initializing eslint in the project with `npx eslint --init`. Finally, it suggested installing jest and ts-jest, as well as initializing them with `npx ts-jest config:init` and a code base for the proposed jest configuration file:

```js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Use 'jsdom' if testing browser features
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
};
```

So now that the project has been initialized, if we run the command `npm run dev`, it launches a base page created with the vite template.

