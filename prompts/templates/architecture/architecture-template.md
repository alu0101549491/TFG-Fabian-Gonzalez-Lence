# PROJECT CONTEXT
Project: [Application name]
Description: [Summary in 2-3 lines]
Selected architecture: [MVC, Hexagonal, Microservices, etc.]
Technology stack: TypeScript, HTML, CSS, Vite, TypeDoc, ESLint, Jest, TSJest, [main frameworks]

# AVAILABLE DESIGN ARTIFACTS
- Main class diagram: [Attach]
- Main use case diagram: [Attach]
- Design patterns to apply: [E.g.: Repository, Factory, Observer]
- Relevant non-functional requirements: [E.g.: scalability, maintainability]

# TASK
Generate the complete folder and file structure of the project following these specifications:

## Required structure:
- Clear separation of layers/modules according to the architecture and class diagram
- TypeScript naming conventions following the Google Style Guide
- Initial configuration (dependencies, build, etc.)
- Base documentation files (README, ARCHITECTURE.md)

## Expected deliverables:
1. Complete directory tree (src, docs, tests, config, etc.)
2. Configuration files (package.json, jest.config.js, jest.setup.js, tsconfig.json, typedoc.json, vite.config.js, eslint.config.mjs, etc.)
3. Main classes/modules as empty skeletons with:
   - Class names according to UML class diagram
   - Methods declared without implementation
   - Comments with responsibilities of each component
4. README.md with setup instructions
5. Jest and TSJest properly configured
6. Vite properly configured to work with TypeScript
7. ESLint properly configured to follow the Google Style Guide

# CONSTRAINTS
- DO NOT implement logic yet, only structure
- Use consistent nomenclature as seen in the class diagram and following the quality metrics of the Google Style Guide
- Include appropriate .gitignore files
- Prepare structure for testing from the start

# OUTPUT FORMAT
Provide:
1. Textual listing of the folder structure
2. Content of each configuration file
3. Skeletons of main classes
4. Brief justification of architectural decisions
5. Bash commands necessary to initialize the project
6. Bash commands necessary to install technology stack elements (TypeScript, HTML, CSS, Vite, TypeDoc, ESLint, Jest, TSJest, [main frameworks])
7. Bash commands necessary to properly configure the project (package.json, jest.config.js, jest.setup.js, tsconfig.json, typedoc.json, vite.config.js, eslint.config.mjs, etc.)