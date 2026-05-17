# Respuesta

## 1.2. Respuesta {toggle="true"}
		```markdown
I'll generate the complete folder and file structure for the Cartographic Project Manager (CPM) following the Layered Architecture with Clean Architecture principles.

## 1. FOLDER STRUCTURE

```
4-CartographicProjectManager/
├── .gitignore
├── .eslintignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.mjs
├── jest.config.js
├── jest.setup.js
├── typedoc.json
├── README.md
├── ARCHITECTURE.md
├── docs/
│   ├── api/
│   ├── diagrams/
│   └── guides/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Project.ts
│   │   │   ├── Task.ts
│   │   │   ├── Message.ts
│   │   │   ├── Notification.ts
│   │   │   ├── File.ts
│   │   │   ├── Permission.ts
│   │   │   └── TaskHistory.ts
│   │   ├── value-objects/
│   │   │   └── GeoCoordinates.ts
│   │   ├── enums/
│   │   │   ├── UserRole.ts
│   │   │   ├── ProjectType.ts
│   │   │   ├── ProjectStatus.ts
│   │   │   ├── TaskStatus.ts
│   │   │   ├── TaskPriority.ts
│   │   │   ├── NotificationType.ts
│   │   │   ├── FileType.ts
│   │   │   └── AccessRight.ts
│   │   └── repositories/
│   │       ├── IUserRepository.ts
│   │       ├── IProjectRepository.ts
│   │       ├── ITaskRepository.ts
│   │       ├── IMessageRepository.ts
│   │       ├── INotificationRepository.ts
│   │       ├── IFileRepository.ts
│   │       ├── IPermissionRepository.ts
│   │       └── ITaskHistoryRepository.ts
│   ├── application/
│   │   ├── services/
│   │   │   ├── interfaces/
│   │   │   │   ├── IAuthenticationService.ts
│   │   │   │   ├── IProjectService.ts
│   │   │   │   ├── ITaskService.ts
│   │   │   │   ├── IMessageService.ts
│   │   │   │   ├── INotificationService.ts
│   │   │   │   ├── IFileService.ts
│   │   │   │   ├── IAuthorizationService.ts
│   │   │   │   ├── IExportService.ts
│   │   │   │   └── IBackupService.ts
│   │   │   └── implementations/
│   │   │       ├── AuthenticationService.ts
│   │   │       ├── ProjectService.ts
│   │   │       ├── TaskService.ts
│   │   │       ├── MessageService.ts
│   │   │       ├── NotificationService.ts
│   │   │       ├── FileService.ts
│   │   │       ├── AuthorizationService.ts
│   │   │       ├── ExportService.ts
│   │   │       └── BackupService.ts
│   │   └── dtos/
│   │       ├── AuthResult.ts
│   │       ├── ProjectData.ts
│   │       ├── TaskData.ts
│   │       ├── MessageData.ts
│   │       ├── FileData.ts
│   │       ├── ExportFilters.ts
│   │       ├── ValidationResult.ts
│   │       └── BackupResult.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── UserRepository.ts
│   │   │   ├── ProjectRepository.ts
│   │   │   ├── TaskRepository.ts
│   │   │   ├── MessageRepository.ts
│   │   │   ├── NotificationRepository.ts
│   │   │   ├── FileRepository.ts
│   │   │   ├── PermissionRepository.ts
│   │   │   └── TaskHistoryRepository.ts
│   │   ├── external-services/
│   │   │   ├── interfaces/
│   │   │   │   ├── IDropboxService.ts
│   │   │   │   └── IWhatsAppGateway.ts
│   │   │   └── implementations/
│   │   │       ├── DropboxService.ts
│   │   │       └── WhatsAppGateway.ts
│   │   ├── websocket/
│   │   │   ├── SocketManager.ts
│   │   │   └── NotificationHandler.ts
│   │   └── persistence/
│   │       ├── database.ts
│   │       └── migrations/
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppSidebar.vue
│   │   │   │   ├── AppFooter.vue
│   │   │   │   ├── LoadingSpinner.vue
│   │   │   │   └── ErrorMessage.vue
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.vue
│   │   │   │   └── SessionTimeout.vue
│   │   │   ├── projects/
│   │   │   │   ├── ProjectList.vue
│   │   │   │   ├── ProjectCard.vue
│   │   │   │   ├── ProjectDetails.vue
│   │   │   │   ├── ProjectForm.vue
│   │   │   │   └── ProjectCalendar.vue
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.vue
│   │   │   │   ├── TaskCard.vue
│   │   │   │   ├── TaskForm.vue
│   │   │   │   └── TaskHistory.vue
│   │   │   ├── messages/
│   │   │   │   ├── MessageList.vue
│   │   │   │   ├── MessageItem.vue
│   │   │   │   └── MessageForm.vue
│   │   │   ├── files/
│   │   │   │   ├── FileUpload.vue
│   │   │   │   ├── FileList.vue
│   │   │   │   └── FileItem.vue
│   │   │   └── notifications/
│   │   │       ├── NotificationBell.vue
│   │   │       └── NotificationList.vue
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── ProjectsView.vue
│   │   │   ├── ProjectDetailView.vue
│   │   │   ├── CalendarView.vue
│   │   │   └── NotFoundView.vue
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── projectStore.ts
│   │   │   ├── taskStore.ts
│   │   │   ├── messageStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── composables/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useTasks.ts
│   │   │   ├── useMessages.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useWebSocket.ts
│   │   ├── router/
│   │   │   ├── index.ts
│   │   │   └── guards.ts
│   │   ├── assets/
│   │   │   ├── styles/
│   │   │   │   ├── main.css
│   │   │   │   ├── variables.css
│   │   │   │   └── responsive.css
│   │   │   └── images/
│   │   └── App.vue
│   ├── main.ts
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── User.test.ts
│   │   │   │   ├── Project.test.ts
│   │   │   │   └── Task.test.ts
│   │   │   └── value-objects/
│   │   │       └── GeoCoordinates.test.ts
│   │   ├── application/
│   │   │   └── services/
│   │   │       ├── AuthenticationService.test.ts
│   │   │       ├── ProjectService.test.ts
│   │   │       └── TaskService.test.ts
│   │   └── infrastructure/
│   │       └── repositories/
│   │           ├── UserRepository.test.ts
│   │           └── ProjectRepository.test.ts
│   ├── integration/
│   │   ├── api/
│   │   └── services/
│   └── setup/
│       └── testHelpers.ts
└── public/
    ├── favicon.ico
    └── robots.txt
```

## 2. BASH COMMANDS TO INITIALIZE AND CONFIGURE THE PROJECT

```bash
# Create project directory
mkdir cartographic-project-manager
cd cartographic-project-manager

# Initialize npm project
npm init -y

# Install core dependencies
npm install vue@^3.4.0 vue-router@^4.2.0 pinia@^2.1.0
npm install axios@^1.6.0 socket.io-client@^4.6.0

# Install development dependencies
npm install -D typescript@^5.3.0 @types/node@^20.10.0
npm install -D vite@^5.0.0 @vitejs/plugin-vue@^5.0.0
npm install -D eslint@^8.56.0 @typescript-eslint/parser@^6.18.0 @typescript-eslint/eslint-plugin@^6.18.0
npm install -D jest@^29.7.0 ts-jest@^29.1.0 @types/jest@^29.5.0
npm install -D @vue/test-utils@^2.4.0 @testing-library/vue@^8.0.0
npm install -D typedoc@^0.25.0

# Create directory structure
mkdir -p src/domain/{entities,value-objects,enums,repositories}
mkdir -p src/application/{services/{interfaces,implementations},dtos}
mkdir -p src/infrastructure/{repositories,external-services/{interfaces,implementations},websocket,persistence/migrations}
mkdir -p src/presentation/{components/{common,auth,projects,tasks,messages,files,notifications},views,stores,composables,router,assets/{styles,images}}
mkdir -p tests/{unit/{domain/{entities,value-objects},application/services,infrastructure/repositories},integration/{api,services},setup}
mkdir -p docs/{api,diagrams,guides}
mkdir -p public

# Create necessary files (will be populated in next steps)
touch .gitignore .eslintignore
touch package.json tsconfig.json tsconfig.node.json vite.config.ts
touch eslint.config.mjs jest.config.js jest.setup.js typedoc.json
touch README.md ARCHITECTURE.md
```

## 3. CONFIGURATION FILES

### `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov
.nyc_output

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Temporary files
*.tmp
.cache/

# Documentation build
docs/api/generated/
```

### `.eslintignore`

```
node_modules/
dist/
coverage/
*.config.js
*.config.ts
*.d.ts
```

### `package.json`

```json
{
  "name": "cartographic-project-manager",
  "version": "1.0.0",
  "description": "Web and mobile application for comprehensive management of cartographic projects",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.vue",
    "lint:fix": "eslint . --ext .ts,.vue --fix",
    "docs": "typedoc"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0"
  },
  "devDependencies": {
    "@testing-library/vue": "^8.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.18.0",
    "@typescript-eslint/parser": "^6.18.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.2",
    "typedoc": "^0.25.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.27"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@presentation/*": ["./src/presentation/*"]
    },

    /* Type declarations */
    "types": ["vite/client", "jest", "node"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### `vite.config.ts`

```typescript
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath, URL} from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@application': fileURLToPath(
          new URL('./src/application', import.meta.url)),
      '@infrastructure': fileURLToPath(
          new URL('./src/infrastructure', import.meta.url)),
      '@presentation': fileURLToPath(
          new URL('./src/presentation', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

### `eslint.config.mjs`

```javascript
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Google Style Guide rules
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', {avoidEscape: true}],
      'semi': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'max-len': ['error', {code: 80, ignoreUrls: true}],
      
      // TypeScript specific
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
      }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
];
```

### `jest.config.js`

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
    '^.+\\.vue$': '@vue/vue3-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'vue'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
```

### `jest.setup.js`

```javascript
// Add custom matchers or global test setup here
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### `typedoc.json`

```json
{
  "entryPoints": ["./src"],
  "entryPointStrategy": "expand",
  "out": "./docs/api/generated",
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**"
  ],
  "excludePrivate": true,
  "excludeProtected": false,
  "includeVersion": true,
  "readme": "./README.md",
  "name": "Cartographic Project Manager API Documentation",
  "navigationLinks": {
    "GitHub": "https://github.com/your-org/cartographic-project-manager"
  }
}
```

## 4. MAIN CLASS SKELETONS

### Domain Layer - Entities

#### `src/domain/entities/User.ts`

```typescript
import {UserRole} from '../enums/UserRole';
import {Project} from './Project';
import {Permission} from './Permission';

/**
 * User entity representing a system user
 * Can be Administrator, Client, or Special User
 */
export class User {
  private id: string;
  private username: string;
  private email: string;
  private passwordHash: string;
  private role: UserRole;
  private createdAt: Date;
  private lastLogin: Date;

  constructor(
    id: string,
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole,
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = new Date();
    this.lastLogin = new Date();
  }

  /**
   * Authenticates user with provided password
   * @param password - Plain text password to verify
   * @returns True if authentication successful
   */
  public authenticate(password: string): boolean {
    // TODO: Implement authentication logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user has specific permission
   * @param permission - Permission to check
   * @returns True if user has the permission
   */
  public hasPermission(permission: Permission): boolean {
    // TODO: Implement permission check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Gets all projects assigned to this user
   * @returns List of assigned projects
   */
  public getAssignedProjects(): Project[] {
    // TODO: Implement get assigned projects logic
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getLastLogin(): Date {
    return this.lastLogin;
  }

  public setLastLogin(date: Date): void {
    this.lastLogin = date;
  }
}
```

#### `src/domain/entities/Project.ts`

```typescript
import {ProjectType} from '../enums/ProjectType';
import {ProjectStatus} from '../enums/ProjectStatus';
import {GeoCoordinates} from '../value-objects/GeoCoordinates';
import {Permission} from './Permission';

/**
 * Project entity representing a cartographic project
 * Contains project metadata, status, and relationships
 */
export class Project {
  private id: string;
  private code: string;
  private name: string;
  private clientId: string;
  private type: ProjectType;
  private startDate: Date;
  private deliveryDate: Date;
  private coordinates: GeoCoordinates;
  private status: ProjectStatus;
  private dropboxFolderId: string;
  private finalizedAt?: Date;

  constructor(
    id: string,
    code: string,
    name: string,
    clientId: string,
    type: ProjectType,
    startDate: Date,
    deliveryDate: Date,
    coordinates: GeoCoordinates,
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.clientId = clientId;
    this.type = type;
    this.startDate = startDate;
    this.deliveryDate = deliveryDate;
    this.coordinates = coordinates;
    this.status = ProjectStatus.ACTIVE;
    this.dropboxFolderId = '';
  }

  /**
   * Assigns project to a client
   * @param clientId - ID of the client to assign
   */
  public assignToClient(clientId: string): void {
    // TODO: Implement assign to client logic
    throw new Error('Method not implemented.');
  }

  /**
   * Adds a special user with specific permissions
   * @param userId - ID of the user to add
   * @param permissions - Set of permissions to grant
   */
  public addSpecialUser(userId: string, permissions: Set<Permission>): void {
    // TODO: Implement add special user logic
    throw new Error('Method not implemented.');
  }

  /**
   * Finalizes the project
   */
  public finalize(): void {
    // TODO: Implement finalize logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if project can be finalized
   * @returns True if project meets finalization criteria
   */
  public canBeFinalized(): boolean {
    // TODO: Implement can be finalized check
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user has access to this project
   * @param userId - ID of the user to check
   * @returns True if user can access project
   */
  public isAccessibleBy(userId: string): boolean {
    // TODO: Implement accessibility check
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getType(): ProjectType {
    return this.type;
  }

  public getStatus(): ProjectStatus {
    return this.status;
  }

  public setStatus(status: ProjectStatus): void {
    this.status = status;
  }

  public getDropboxFolderId(): string {
    return this.dropboxFolderId;
  }

  public setDropboxFolderId(folderId: string): void {
    this.dropboxFolderId = folderId;
  }
}
```

#### `src/domain/entities/Task.ts`

```typescript
import {TaskStatus} from '../enums/TaskStatus';
import {TaskPriority} from '../enums/TaskPriority';

/**
 * Task entity representing a project task
 * Can be created by admin or client and assigned bidirectionally
 */
export class Task {
  private id: string;
  private projectId: string;
  private creatorId: string;
  private assigneeId: string;
  private description: string;
  private status: TaskStatus;
  private priority: TaskPriority;
  private dueDate: Date;
  private createdAt: Date;
  private updatedAt: Date;
  private fileIds: string[];

  constructor(
    id: string,
    projectId: string,
    creatorId: string,
    assigneeId: string,
    description: string,
    priority: TaskPriority,
    dueDate: Date,
  ) {
    this.id = id;
    this.projectId = projectId;
    this.creatorId = creatorId;
    this.assigneeId = assigneeId;
    this.description = description;
    this.status = TaskStatus.PENDING;
    this.priority = priority;
    this.dueDate = dueDate;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.fileIds = [];
  }

  /**
   * Changes task status with audit trail
   * @param newStatus - New status to set
   * @param userId - ID of user making the change
   */
  public changeStatus(newStatus: TaskStatus, userId: string): void {
    // TODO: Implement change status logic
    throw new Error('Method not implemented.');
  }

  /**
   * Attaches a file to this task
   * @param fileId - ID of the file to attach
   */
  public attachFile(fileId: string): void {
    // TODO: Implement attach file logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if task can be modified by user
   * @param userId - ID of user to check
   * @returns True if user can modify task
   */
  public canBeModifiedBy(userId: string): boolean {
    // TODO: Implement modification permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if task can be deleted by user
   * @param userId - ID of user to check
   * @returns True if user can delete task
   */
  public canBeDeletedBy(userId: string): boolean {
    // TODO: Implement deletion permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Marks task as completed
   * @param userId - ID of user completing the task
   */
  public markAsCompleted(userId: string): void {
    // TODO: Implement mark as completed logic
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getStatus(): TaskStatus {
    return this.status;
  }

  public getPriority(): TaskPriority {
    return this.priority;
  }

  public getDescription(): string {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }
}
```

#### `src/domain/entities/Message.ts`

```typescript
/**
 * Message entity for project-specific internal messaging
 */
export class Message {
  private id: string;
  private projectId: string;
  private senderId: string;
  private content: string;
  private sentAt: Date;
  private fileIds: string[];
  private readByUserIds: string[];

  constructor(
    id: string,
    projectId: string,
    senderId: string,
    content: string,
  ) {
    this.id = id;
    this.projectId = projectId;
    this.senderId = senderId;
    this.content = content;
    this.sentAt = new Date();
    this.fileIds = [];
    this.readByUserIds = [];
  }

  /**
   * Marks message as read by a user
   * @param userId - ID of user who read the message
   */
  public markAsRead(userId: string): void {
    // TODO: Implement mark as read logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if message was read by specific user
   * @param userId - ID of user to check
   * @returns True if message was read by user
   */
  public isReadBy(userId: string): boolean {
    // TODO: Implement read check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Attaches a file to this message
   * @param fileId - ID of file to attach
   */
  public attachFile(fileId: string): void {
    // TODO: Implement attach file logic
    throw new Error('Method not implemented.');
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getSenderId(): string {
    return this.senderId;
  }

  public getContent(): string {
    return this.content;
  }

  public getSentAt(): Date {
    return this.sentAt;
  }

  public getFileIds(): string[] {
    return [...this.fileIds];
  }
}
```

#### `src/domain/entities/Notification.ts`

```typescript
import {NotificationType} from '../enums/NotificationType';

/**
 * Notification entity for system notifications
 * Can be sent via web interface and optionally WhatsApp
 */
export class Notification {
  private id: string;
  private userId: string;
  private type: NotificationType;
  private title: string;
  private message: string;
  private relatedEntityId: string;
  private createdAt: Date;
  private isRead: boolean;
  private sentViaWhatsApp: boolean;

  constructor(
    id: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId: string,
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.relatedEntityId = relatedEntityId;
    this.createdAt = new Date();
    this.isRead = false;
    this.sentViaWhatsApp = false;
  }

  /**
   * Marks notification as read
   */
  public markAsRead(): void {
    // TODO: Implement mark as read logic
    throw new Error('Method not implemented.');
  }

  /**
   * Determines if notification should be sent via WhatsApp
   * @returns True if should send via WhatsApp
   */
  public shouldSendViaWhatsApp(): boolean {
    // TODO: Implement WhatsApp send determination logic
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getType(): NotificationType {
    return this.type;
  }

  public getIsRead(): boolean {
    return this.isRead;
  }

  public getSentViaWhatsApp(): boolean {
    return this.sentViaWhatsApp;
  }

  public setSentViaWhatsApp(sent: boolean): void {
    this.sentViaWhatsApp = sent;
  }
}
```

#### `src/domain/entities/File.ts`

```typescript
import {FileType} from '../enums/FileType';

/**
 * File entity representing uploaded files
 * Stored in Dropbox with metadata in database
 */
export class File {
  private id: string;
  private name: string;
  private dropboxPath: string;
  private type: FileType;
  private sizeInBytes: number;
  private uploadedBy: string;
  private uploadedAt: Date;

  constructor(
    id: string,
    name: string,
    dropboxPath: string,
    type: FileType,
    sizeInBytes: number,
    uploadedBy: string,
  ) {
    this.id = id;
    this.name = name;
    this.dropboxPath = dropboxPath;
    this.type = type;
    this.sizeInBytes = sizeInBytes;
    this.uploadedBy = uploadedBy;
    this.uploadedAt = new Date();
  }

  /**
   * Validates file format against allowed types
   * @returns True if format is valid
   */
  public isValidFormat(): boolean {
    // TODO: Implement format validation logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if file is within size limits
   * @returns True if size is acceptable
   */
  public isWithinSizeLimit(): boolean {
    // TODO: Implement size validation logic
    throw new Error('Method not implemented.');
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDropboxPath(): string {
    return this.dropboxPath;
  }

  public getType(): FileType {
    return this.type;
  }

  public getSizeInBytes(): number {
    return this.sizeInBytes;
  }

  public getUploadedBy(): string {
    return this.uploadedBy;
  }

  public getUploadedAt(): Date {
    return this.uploadedAt;
  }
}
```

#### `src/domain/entities/Permission.ts`

```typescript
import {AccessRight} from '../enums/AccessRight';

/**
 * Permission entity for user access rights on projects
 * Used for special users with custom permissions
 */
export class Permission {
  private userId: string;
  private projectId: string;
  private rights: Set<AccessRight>;

  constructor(userId: string, projectId: string, rights: Set<AccessRight>) {
    this.userId = userId;
    this.projectId = projectId;
    this.rights = rights;
  }

  /**
   * Checks if user can view project content
   * @returns True if view permission granted
   */
  public canView(): boolean {
    // TODO: Implement view check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user can download files
   * @returns True if download permission granted
   */
  public canDownload(): boolean {
    // TODO: Implement download check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user can edit project content
   * @returns True if edit permission granted
   */
  public canEdit(): boolean {
    // TODO: Implement edit check logic
    throw new Error('Method not implemented.');
  }

  // Getters
  public getUserId(): string {
    return this.userId;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getRights(): Set<AccessRight> {
    return new Set(this.rights);
  }

  public addRight(right: AccessRight): void {
    this.rights.add(right);
  }

  public removeRight(right: AccessRight): void {
    this.rights.delete(right);
  }
}
```

#### `src/domain/entities/TaskHistory.ts`

```typescript
/**
 * TaskHistory entity for audit trail of task changes
 */
export class TaskHistory {
  private id: string;
  private taskId: string;
  private userId: string;
  private action: string;
  private previousValue: string;
  private newValue: string;
  private timestamp: Date;

  constructor(
    id: string,
    taskId: string,
    userId: string,
    action: string,
    previousValue: string,
    newValue: string,
  ) {
    this.id = id;
    this.taskId = taskId;
    this.userId = userId;
    this.action = action;
    this.previousValue = previousValue;
    this.newValue = newValue;
    this.timestamp = new Date();
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getTaskId(): string {
    return this.taskId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getAction(): string {
    return this.action;
  }

  public getPreviousValue(): string {
    return this.previousValue;
  }

  public getNewValue(): string {
    return this.newValue;
  }

  public getTimestamp(): Date {
    return this.timestamp;
  }
}
```

### Domain Layer - Value Objects

#### `src/domain/value-objects/GeoCoordinates.ts`

```typescript
/**
 * Value object representing geographic coordinates
 * Immutable and validates coordinate ranges
 */
export class GeoCoordinates {
  private readonly latitude: number;
  private readonly longitude: number;

  constructor(latitude: number, longitude: number) {
    if (!this.isValidLatitude(latitude)) {
      throw new Error('Invalid latitude: must be between -90 and 90');
    }
    if (!this.isValidLongitude(longitude)) {
      throw new Error('Invalid longitude: must be between -180 and 180');
    }
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * Validates the coordinate values
   * @returns True if coordinates are valid
   */
  public isValid(): boolean {
    return this.isValidLatitude(this.latitude) &&
           this.isValidLongitude(this.longitude);
  }

  private isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  private isValidLongitude(lng: number): boolean {
    return lng >= -180 && lng <= 180;
  }

  // Getters
  public getLatitude(): number {
    return this.latitude;
  }

  public getLongitude(): number {
    return this.longitude;
  }

  /**
   * Creates a string representation of coordinates
   * @returns Formatted coordinate string
   */
  public toString(): string {
    return `${this.latitude}, ${this.longitude}`;
  }

  /**
   * Compares with another GeoCoordinates instance
   * @param other - Another GeoCoordinates to compare
   * @returns True if coordinates are equal
   */
  public equals(other: GeoCoordinates): boolean {
    return this.latitude === other.latitude &&
           this.longitude === other.longitude;
  }
}
```

### Domain Layer - Enums

#### `src/domain/enums/UserRole.ts`

```typescript
/**
 * Enumeration of user roles in the system
 */
export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  CLIENT = 'CLIENT',
  SPECIAL_USER = 'SPECIAL_USER',
}
```

#### `src/domain/enums/ProjectType.ts`

```typescript
/**
 * Enumeration of project types
 */
export enum ProjectType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  PUBLIC = 'PUBLIC',
}
```

#### `src/domain/enums/ProjectStatus.ts`

```typescript
/**
 * Enumeration of project statuses
 */
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  FINALIZED = 'FINALIZED',
}
```

#### `src/domain/enums/TaskStatus.ts`

```typescript
/**
 * Enumeration of task statuses
 */
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PARTIAL = 'PARTIAL',
  PERFORMED = 'PERFORMED',
  COMPLETED = 'COMPLETED',
}
```

#### `src/domain/enums/TaskPriority.ts`

```typescript
/**
 * Enumeration of task priorities
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
```

#### `src/domain/enums/NotificationType.ts`

```typescript
/**
 * Enumeration of notification types
 */
export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_TASK = 'NEW_TASK',
  TASK_STATUS_CHANGE = 'TASK_STATUS_CHANGE',
  FILE_RECEIVED = 'FILE_RECEIVED',
  PROJECT_ASSIGNED = 'PROJECT_ASSIGNED',
  PROJECT_FINALIZED = 'PROJECT_FINALIZED',
}
```

#### `src/domain/enums/FileType.ts`

```typescript
/**
 * Enumeration of supported file types
 */
export enum FileType {
  PDF = 'PDF',
  KML = 'KML',
  SHP = 'SHP',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
}
```

#### `src/domain/enums/AccessRight.ts`

```typescript
/**
 * Enumeration of access rights for permissions
 */
export enum AccessRight {
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}
```

### Domain Layer - Repository Interfaces

#### `src/domain/repositories/IUserRepository.ts`

```typescript
import {User} from '../entities/User';
import {UserRole} from '../enums/UserRole';

/**
 * Repository interface for User entity persistence
 */
export interface IUserRepository {
  /**
   * Finds a user by ID
   * @param id - User ID
   * @returns User entity or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by username
   * @param username - Username to search
   * @returns User entity or null if not found
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Saves a new user
   * @param user - User entity to save
   * @returns Saved user entity
   */
  save(user: User): Promise<User>;

  /**
   * Updates an existing user
   * @param user - User entity to update
   * @returns Updated user entity
   */
  update(user: User): Promise<User>;

  /**
   * Finds users by role
   * @param role - User role to filter
   * @returns List of users with specified role
   */
  findByRole(role: UserRole): Promise<User[]>;
}
```

#### `src/domain/repositories/IProjectRepository.ts`

```typescript
import {Project} from '../entities/Project';

/**
 * Repository interface for Project entity persistence
 */
export interface IProjectRepository {
  /**
   * Finds a project by ID
   * @param id - Project ID
   * @returns Project entity or null if not found
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Saves a new project
   * @param project - Project entity to save
   * @returns Saved project entity
   */
  save(project: Project): Promise<Project>;

  /**
   * Updates an existing project
   * @param project - Project entity to update
   * @returns Updated project entity
   */
  update(project: Project): Promise<Project>;

  /**
   * Finds projects assigned to a client
   * @param clientId - Client user ID
   * @returns List of client's projects
   */
  findByClientId(clientId: string): Promise<Project[]>;

  /**
   * Finds projects accessible by a special user
   * @param userId - Special user ID
   * @returns List of accessible projects
   */
  findBySpecialUserId(userId: string): Promise<Project[]>;

  /**
   * Retrieves all projects
   * @returns List of all projects
   */
  findAll(): Promise<Project[]>;
}
```

#### `src/domain/repositories/ITaskRepository.ts`

```typescript
import {Task} from '../entities/Task';

/**
 * Repository interface for Task entity persistence
 */
export interface ITaskRepository {
  /**
   * Finds a task by ID
   * @param id - Task ID
   * @returns Task entity or null if not found
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Saves a new task
   * @param task - Task entity to save
   * @returns Saved task entity
   */
  save(task: Task): Promise<Task>;

  /**
   * Updates an existing task
   * @param task - Task entity to update
   * @returns Updated task entity
   */
  update(task: Task): Promise<Task>;

  /**
   * Deletes a task by ID
   * @param id - Task ID to delete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all tasks for a project
   * @param projectId - Project ID
   * @returns List of project tasks
   */
  findByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Finds tasks assigned to a user
   * @param userId - Assignee user ID
   * @returns List of assigned tasks
   */
  findByAssigneeId(userId: string): Promise<Task[]>;
}
```

#### `src/domain/repositories/IMessageRepository.ts`

```typescript
import {Message} from '../entities/Message';

/**
 * Repository interface for Message entity persistence
 */
export interface IMessageRepository {
  /**
   * Finds a message by ID
   * @param id - Message ID
   * @returns Message entity or null if not found
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Saves a new message
   * @param message - Message entity to save
   * @returns Saved message entity
   */
  save(message: Message): Promise<Message>;

  /**
   * Finds messages for a project
   * @param projectId - Project ID
   * @returns List of project messages
   */
  findByProjectId(projectId: string): Promise<Message[]>;

  /**
   * Counts unread messages for a user in a project
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns Count of unread messages
   */
  countUnreadByUser(projectId: string, userId: string): Promise<number>;
}
```

#### `src/domain/repositories/INotificationRepository.ts`

```typescript
import {Notification} from '../entities/Notification';

/**
 * Repository interface for Notification entity persistence
 */
export interface INotificationRepository {
  /**
   * Finds a notification by ID
   * @param id - Notification ID
   * @returns Notification entity or null if not found
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Saves a new notification
   * @param notification - Notification entity to save
   * @returns Saved notification entity
   */
  save(notification: Notification): Promise<Notification>;

  /**
   * Finds notifications for a user
   * @param userId - User ID
   * @returns List of user notifications
   */
  findByUserId(userId: string): Promise<Notification[]>;

  /**
   * Marks a notification as read
   * @param id - Notification ID
   */
  markAsRead(id: string): Promise<void>;
}
```

#### `src/domain/repositories/IFileRepository.ts`

```typescript
import {File} from '../entities/File';

/**
 * Repository interface for File entity persistence
 */
export interface IFileRepository {
  /**
   * Finds a file by ID
   * @param id - File ID
   * @returns File entity or null if not found
   */
  findById(id: string): Promise<File | null>;

  /**
   * Saves a new file
   * @param file - File entity to save
   * @returns Saved file entity
   */
  save(file: File): Promise<File>;

  /**
   * Deletes a file by ID
   * @param id - File ID to delete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds files attached to a task
   * @param taskId - Task ID
   * @returns List of task files
   */
  findByTaskId(taskId: string): Promise<File[]>;

  /**
   * Finds files attached to a message
   * @param messageId - Message ID
   * @returns List of message files
   */
  findByMessageId(messageId: string): Promise<File[]>;
}
```

#### `src/domain/repositories/IPermissionRepository.ts`

```typescript
import {Permission} from '../entities/Permission';

/**
 * Repository interface for Permission entity persistence
 */
export interface IPermissionRepository {
  /**
   * Finds permission for user on project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Permission entity or null if not found
   */
  findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Permission | null>;

  /**
   * Saves a new permission
   * @param permission - Permission entity to save
   * @returns Saved permission entity
   */
  save(permission: Permission): Promise<Permission>;

  /**
   * Updates an existing permission
   * @param permission - Permission entity to update
   * @returns Updated permission entity
   */
  update(permission: Permission): Promise<Permission>;

  /**
   * Deletes a permission
   * @param userId - User ID
   * @param projectId - Project ID
   */
  delete(userId: string, projectId: string): Promise<void>;
}
```

#### `src/domain/repositories/ITaskHistoryRepository.ts`

```typescript
import {TaskHistory} from '../entities/TaskHistory';

/**
 * Repository interface for TaskHistory entity persistence
 */
export interface ITaskHistoryRepository {
  /**
   * Saves a new task history entry
   * @param history - TaskHistory entity to save
   * @returns Saved TaskHistory entity
   */
  save(history: TaskHistory): Promise<TaskHistory>;

  /**
   * Finds history entries for a task
   * @param taskId - Task ID
   * @returns List of task history entries
   */
  findByTaskId(taskId: string): Promise<TaskHistory[]>;
}
```

### Application Layer - Service Interfaces

#### `src/application/services/interfaces/IAuthenticationService.ts`

```typescript
import {AuthResult} from '../../dtos/AuthResult';

/**
 * Authentication service interface
 * Handles user authentication and session management
 */
export interface IAuthenticationService {
  /**
   * Authenticates user with credentials
   * @param username - Username
   * @param password - Password
   * @returns Authentication result with token
   */
  login(username: string, password: string): Promise<AuthResult>;

  /**
   * Logs out user and invalidates session
   * @param userId - User ID to logout
   */
  logout(userId: string): Promise<void>;

  /**
   * Validates session token
   * @param sessionToken - Session token to validate
   * @returns True if session is valid
   */
  validateSession(sessionToken: string): Promise<boolean>;

  /**
   * Refreshes an existing session
   * @param sessionToken - Current session token
   * @returns New session token
   */
  refreshSession(sessionToken: string): Promise<string>;
}
```

#### `src/application/services/interfaces/IProjectService.ts`

```typescript
import {Project} from '@domain/entities/Project';
import {ProjectData} from '../../dtos/ProjectData';
import {Permission} from '@domain/entities/Permission';

/**
 * Project service interface
 * Handles project management operations
 */
export interface IProjectService {
  /**
   * Creates a new project
   * @param projectData - Project creation data
   * @returns Created project entity
   */
  createProject(projectData: ProjectData): Promise<Project>;

  /**
   * Assigns project to a client
   * @param projectId - Project ID
   * @param clientId - Client user ID
   */
  assignProjectToClient(projectId: string, clientId: string): Promise<void>;

  /**
   * Adds special user to project with permissions
   * @param projectId - Project ID
   * @param userId - Special user ID
   * @param permissions - Set of permissions
   */
  addSpecialUserToProject(
    projectId: string,
    userId: string,
    permissions: Set<Permission>,
  ): Promise<void>;

  /**
   * Gets projects accessible by user
   * @param userId - User ID
   * @returns List of user's projects
   */
  getProjectsByUser(userId: string): Promise<Project[]>;

  /**
   * Finalizes a project
   * @param projectId - Project ID
   */
  finalizeProject(projectId: string): Promise<void>;

  /**
   * Gets detailed project information
   * @param projectId - Project ID
   * @param userId - Requesting user ID
   * @returns Project details
   */
  getProjectDetails(projectId: string, userId: string): Promise<Project>;
}
```

#### `src/application/services/interfaces/ITaskService.ts`

```typescript
import {Task} from '@domain/entities/Task';
import {TaskData} from '../../dtos/TaskData';
import {TaskStatus} from '@domain/enums/TaskStatus';

/**
 * Task service interface
 * Handles task management operations
 */
export interface ITaskService {
  /**
   * Creates a new task
   * @param taskData - Task creation data
   * @returns Created task entity
   */
  createTask(taskData: TaskData): Promise<Task>;

  /**
   * Updates an existing task
   * @param taskId - Task ID
   * @param updates - Task update data
   * @param userId - User making the update
   * @returns Updated task entity
   */
  updateTask(
    taskId: string,
    updates: TaskData,
    userId: string,
  ): Promise<Task>;

  /**
   * Deletes a task
   * @param taskId - Task ID
   * @param userId - User requesting deletion
   */
  deleteTask(taskId: string, userId: string): Promise<void>;

  /**
   * Changes task status
   * @param taskId - Task ID
   * @param newStatus - New status
   * @param userId - User making the change
   */
  changeTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    userId: string,
  ): Promise<void>;

  /**
   * Attaches file to task
   * @param taskId - Task ID
   * @param fileId - File ID to attach
   */
  attachFileToTask(taskId: string, fileId: string): Promise<void>;

  /**
   * Gets tasks for a project
   * @param projectId - Project ID
   * @returns List of project tasks
   */
  getTasksByProject(projectId: string): Promise<Task[]>;
}
```

#### `src/application/services/interfaces/IMessageService.ts`

```typescript
import {Message} from '@domain/entities/Message';
import {MessageData} from '../../dtos/MessageData';

/**
 * Message service interface
 * Handles project messaging operations
 */
export interface IMessageService {
  /**
   * Sends a new message
   * @param messageData - Message data
   * @returns Created message entity
   */
  sendMessage(messageData: MessageData): Promise<Message>;

  /**
   * Gets messages for a project
   * @param projectId - Project ID
   * @param userId - Requesting user ID
   * @returns List of project messages
   */
  getMessagesByProject(projectId: string, userId: string): Promise<Message[]>;

  /**
   * Marks message as read
   * @param messageId - Message ID
   * @param userId - User ID
   */
  markMessageAsRead(messageId: string, userId: string): Promise<void>;

  /**
   * Gets unread message count
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns Count of unread messages
   */
  getUnreadMessageCount(projectId: string, userId: string): Promise<number>;
}
```

#### `src/application/services/interfaces/INotificationService.ts`

```typescript
import {Notification} from '@domain/entities/Notification';

/**
 * Notification service interface
 * Handles notification delivery
 */
export interface INotificationService {
  /**
   * Sends a notification to user
   * @param notification - Notification entity
   */
  sendNotification(notification: Notification): Promise<void>;

  /**
   * Gets notifications for user
   * @param userId - User ID
   * @returns List of user notifications
   */
  getNotificationsByUser(userId: string): Promise<Notification[]>;

  /**
   * Marks notification as read
   * @param notificationId - Notification ID
   */
  markAsRead(notificationId: string): Promise<void>;

  /**
   * Sends notification via WhatsApp
   * @param notification - Notification to send
   */
  sendViaWhatsApp(notification: Notification): Promise<void>;
}
```

#### `src/application/services/interfaces/IFileService.ts`

```typescript
import {File} from '@domain/entities/File';
import {FileData} from '../../dtos/FileData';
import {ValidationResult} from '../../dtos/ValidationResult';

/**
 * File service interface
 * Handles file upload, download, and validation
 */
export interface IFileService {
  /**
   * Uploads a file to Dropbox
   * @param fileData - File data
   * @param projectId - Project ID
   * @returns Created file entity
   */
  uploadFile(fileData: FileData, projectId: string): Promise<File>;

  /**
   * Downloads a file from Dropbox
   * @param fileId - File ID
   * @param userId - Requesting user ID
   * @returns File stream
   */
  downloadFile(fileId: string, userId: string): Promise<Blob>;

  /**
   * Validates file before upload
   * @param fileData - File data to validate
   * @returns Validation result
   */
  validateFile(fileData: FileData): Promise<ValidationResult>;

  /**
   * Deletes a file
   * @param fileId - File ID
   * @param userId - User requesting deletion
   */
  deleteFile(fileId: string, userId: string): Promise<void>;
}
```

#### `src/application/services/interfaces/IAuthorizationService.ts`

```typescript
import {Permission} from '@domain/entities/Permission';

/**
 * Authorization service interface
 * Handles permission checks and access control
 */
export interface IAuthorizationService {
  /**
   * Checks if user can access project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns True if user has access
   */
  canAccessProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if user can modify task
   * @param userId - User ID
   * @param taskId - Task ID
   * @returns True if user can modify
   */
  canModifyTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if user can delete task
   * @param userId - User ID
   * @param taskId - Task ID
   * @returns True if user can delete
   */
  canDeleteTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if user can view messages
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns True if user can view messages
   */
  canViewMessages(userId: string, projectId: string): Promise<boolean>;

  /**
   * Gets user permissions for project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Set of permissions
   */
  getPermissions(userId: string, projectId: string): Promise<Set<Permission>>;
}
```

#### `src/application/services/interfaces/IExportService.ts`

```typescript
import {ExportFilters} from '../../dtos/ExportFilters';

/**
 * Export service interface
 * Handles data export in various formats
 */
export interface IExportService {
  /**
   * Exports projects to file
   * @param filters - Export filters
   * @returns Export file as buffer
   */
  exportProjects(filters: ExportFilters): Promise<Buffer>;

  /**
   * Exports tasks to file
   * @param filters - Export filters
   * @returns Export file as buffer
   */
  exportTasks(filters: ExportFilters): Promise<Buffer>;

  /**
   * Exports data to CSV format
   * @param data - Data to export
   * @returns CSV file as buffer
   */
  exportToCSV(data: unknown[]): Promise<Buffer>;

  /**
   * Exports data to PDF format
   * @param data - Data to export
   * @returns PDF file as buffer
   */
  exportToPDF(data: unknown[]): Promise<Buffer>;
}
```

#### `src/application/services/interfaces/IBackupService.ts`

```typescript
import {BackupResult} from '../../dtos/BackupResult';

/**
 * Backup service interface
 * Handles system backup and restore
 */
export interface IBackupService {
  /**
   * Creates a system backup
   * @returns Backup result
   */
  createBackup(): Promise<BackupResult>;

  /**
   * Restores from backup
   * @param backupId - Backup ID to restore
   * @returns Restore result
   */
  restoreBackup(backupId: string): Promise<BackupResult>;

  /**
   * Schedules automatic backups
   * @param schedule - Cron schedule expression
   */
  scheduleAutomaticBackup(schedule: string): Promise<void>;

  /**
   * Gets backup history
   * @returns List of past backups
   */
  getBackupHistory(): Promise<BackupResult[]>;
}
```

### Application Layer - Service Implementations (Skeletons)

#### `src/application/services/implementations/AuthenticationService.ts`

```typescript
import {IAuthenticationService} from '../interfaces/IAuthenticationService';
import {IUserRepository} from '@domain/repositories/IUserRepository';
import {AuthResult} from '../../dtos/AuthResult';

/**
 * Authentication service implementation
 */
export class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async login(username: string, password: string): Promise<AuthResult> {
    // TODO: Implement login logic
    throw new Error('Method not implemented.');
  }

  async logout(userId: string): Promise<void> {
    // TODO: Implement logout logic
    throw new Error('Method not implemented.');
  }

  async validateSession(sessionToken: string): Promise<boolean> {
    // TODO: Implement session validation logic
    throw new Error('Method not implemented.');
  }

  async refreshSession(sessionToken: string): Promise<string> {
    // TODO: Implement session refresh logic
    throw new Error('Method not implemented.');
  }
}
```

#### `src/application/services/implementations/ProjectService.ts`

```typescript
import {IProjectService} from '../interfaces/IProjectService';
import {IProjectRepository} from '@domain/repositories/IProjectRepository';
import {Project} from '@domain/entities/Project';
import {ProjectData} from '../../dtos/ProjectData';
import {Permission} from '@domain/entities/Permission';

/**
 * Project service implementation
 */
export class ProjectService implements IProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
  ) {}

  async createProject(projectData: ProjectData): Promise<Project> {
    // TODO: Implement create project logic
    throw new Error('Method not implemented.');
  }

  async assignProjectToClient(
      projectId: string,
      clientId: string,
  ): Promise<void> {
    // TODO: Implement assign project logic
    throw new Error('Method not implemented.');
  }

  async addSpecialUserToProject(
      projectId: string,
      userId: string,
      permissions: Set<Permission>,
  ): Promise<void> {
    // TODO: Implement add special user logic
    throw new Error('Method not implemented.');
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    // TODO: Implement get projects logic
    throw new Error('Method not implemented.');
  }

  async finalizeProject(projectId: string): Promise<void> {
    // TODO: Implement finalize project logic
    throw new Error('Method not implemented.');
  }

  async getProjectDetails(projectId: string, userId: string): Promise<Project> {
    // TODO: Implement get project details logic
    throw new Error('Method not implemented.');
  }
}
```

### Application Layer - DTOs

#### `src/application/dtos/AuthResult.ts`

```typescript
import {User} from '@domain/entities/User';

/**
 * Authentication result DTO
 */
export interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}
```

#### `src/application/dtos/ProjectData.ts`

```typescript
import {ProjectType} from '@domain/enums/ProjectType';
import {GeoCoordinates} from '@domain/value-objects/GeoCoordinates';

/**
 * Project creation/update data DTO
 */
export interface ProjectData {
  code: string;
  name: string;
  clientId?: string;
  type: ProjectType;
  startDate: Date;
  deliveryDate: Date;
  coordinates: GeoCoordinates;
}
```

#### `src/application/dtos/TaskData.ts`

```typescript
import {TaskPriority} from '@domain/enums/TaskPriority';
import {TaskStatus} from '@domain/enums/TaskStatus';

/**
 * Task creation/update data DTO
 */
export interface TaskData {
  projectId: string;
  creatorId: string;
  assigneeId: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate: Date;
}
```

#### `src/application/dtos/MessageData.ts`

```typescript
/**
 * Message creation data DTO
 */
export interface MessageData {
  projectId: string;
  senderId: string;
  content: string;
  fileIds?: string[];
}
```

#### `src/application/dtos/FileData.ts`

```typescript
import {FileType} from '@domain/enums/FileType';

/**
 * File upload data DTO
 */
export interface FileData {
  name: string;
  type: FileType;
  sizeInBytes: number;
  content: ArrayBuffer;
  uploadedBy: string;
}
```

#### `src/application/dtos/ExportFilters.ts`

```typescript
import {ProjectStatus} from '@domain/enums/ProjectStatus';
import {TaskStatus} from '@domain/enums/TaskStatus';

/**
 * Export filters DTO
 */
export interface ExportFilters {
  projectIds?: string[];
  projectStatus?: ProjectStatus[];
  taskStatus?: TaskStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  format: 'CSV' | 'PDF' | 'EXCEL';
}
```

#### `src/application/dtos/ValidationResult.ts`

```typescript
/**
 * Validation result DTO
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

#### `src/application/dtos/BackupResult.ts`

```typescript
/**
 * Backup operation result DTO
 */
export interface BackupResult {
  backupId: string;
  timestamp: Date;
  success: boolean;
  message?: string;
  filePath?: string;
}
```

### Infrastructure Layer - External Service Interfaces

#### `src/infrastructure/external-services/interfaces/IDropboxService.ts`

```typescript
/**
 * Dropbox service interface
 * Handles file storage operations with Dropbox API
 */
export interface IDropboxService {
  /**
   * Creates a project folder in Dropbox
   * @param projectCode - Project code for folder name
   * @returns Folder ID
   */
  createProjectFolder(projectCode: string): Promise<string>;

  /**
   * Uploads file to Dropbox
   * @param filePath - Dropbox file path
   * @param content - File content
   * @returns File path in Dropbox
   */
  uploadFile(filePath: string, content: Buffer): Promise<string>;

  /**
   * Downloads file from Dropbox
   * @param filePath - Dropbox file path
   * @returns File content
   */
  downloadFile(filePath: string): Promise<Buffer>;

  /**
   * Generates shareable link for file
   * @param filePath - Dropbox file path
   * @returns Share link URL
   */
  generateShareLink(filePath: string): Promise<string>;

  /**
   * Syncs files in folder
   * @param folderId - Dropbox folder ID
   */
  syncFiles(folderId: string): Promise<void>;
}
```

#### `src/infrastructure/external-services/interfaces/IWhatsAppGateway.ts`

```typescript
/**
 * WhatsApp gateway interface
 * Handles WhatsApp message sending
 */
export interface IWhatsAppGateway {
  /**
   * Sends WhatsApp message
   * @param phoneNumber - Recipient phone number
   * @param message - Message content
   * @returns True if sent successfully
   */
  sendMessage(phoneNumber: string, message: string): Promise<boolean>;
}
```

### Presentation Layer - Main Files

#### `src/main.ts`

```typescript
import {createApp} from 'vue';
import {createPinia} from 'pinia';
import App from './App.vue';
import router from './presentation/router';
import './presentation/assets/styles/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');
```

#### `src/App.vue`

```vue
<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
// Main application component
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}
</style>
```

#### `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type {DefineComponent} from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

#### `src/presentation/router/index.ts`

```typescript
import {createRouter, createWebHistory} from 'vue-router';
import type {RouteRecordRaw} from 'vue-router';
import {authGuard} from './guards';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/ProjectsView.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetailView.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

#### `src/presentation/router/guards.ts`

```typescript
import type {NavigationGuardNext, RouteLocationNormalized} from 'vue-router';
import {useAuthStore} from '../stores/authStore';

/**
 * Authentication guard for protected routes
 */
export const authGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
): void => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated) {
    next();
  } else {
    next({name: 'Login'});
  }
};
```

#### `src/presentation/stores/authStore.ts`

```typescript
import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {User} from '@domain/entities/User';

/**
 * Authentication store
 * Manages user authentication state
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value && !!token.value);

  const login = async (username: string, password: string): Promise<void> => {
    // TODO: Implement login logic
    throw new Error('Method not implemented.');
  };

  const logout = async (): Promise<void> => {
    // TODO: Implement logout logic
    throw new Error('Method not implemented.');
  };

  const refreshToken = async (): Promise<void> => {
    // TODO: Implement token refresh logic
    throw new Error('Method not implemented.');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };
});
```

#### `src/presentation/stores/projectStore.ts`

```typescript
import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {Project} from '@domain/entities/Project';

/**
 * Project store
 * Manages project state
 */
export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const loading = ref(false);

  const fetchProjects = async (): Promise<void> => {
    // TODO: Implement fetch projects logic
    throw new Error('Method not implemented.');
  };

  const fetchProjectById = async (id: string): Promise<void> => {
    // TODO: Implement fetch project by id logic
    throw new Error('Method not implemented.');
  };

  const createProject = async (projectData: unknown): Promise<void> => {
    // TODO: Implement create project logic
    throw new Error('Method not implemented.');
  };

  return {
    projects,
    currentProject,
    loading,
    fetchProjects,
    fetchProjectById,
    createProject,
  };
});
```

### Documentation Files

#### `README.md`

```markdown
# Cartographic Project Manager (CPM)

A comprehensive web and mobile application for managing cartographic projects with administrator-client collaboration.

## Features

- **Project Management**: Create, assign, and finalize cartographic projects
- **Task Management**: Bidirectional task assignment between admin and clients
- **Internal Messaging**: Project-specific messaging with file attachments
- **File Management**: Dropbox integration for technical file storage
- **Real-time Notifications**: WebSocket-based notifications with WhatsApp integration
- **Permission System**: Granular access control for special users
- **Export & Backup**: Data export in multiple formats and automated backups

## Technology Stack

- **Frontend**: Vue.js 3 (Composition API), TypeScript, Vite
- **State Management**: Pinia
- **Real-time**: Socket.io
- **HTTP Client**: Axios
- **Testing**: Jest, ts-jest
- **Documentation**: TypeDoc
- **Code Quality**: ESLint (Google Style Guide)

## Architecture

The application follows a **Layered Architecture** with **Clean Architecture** principles:

- **Domain Layer**: Entities, Value Objects, Enumerations, Repository Interfaces
- **Application Layer**: Service Interfaces, Service Implementations, DTOs
- **Infrastructure Layer**: Repository Implementations, External Services
- **Presentation Layer**: Vue.js Components, Stores, Composables, Router

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cartographic-project-manager

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Generate documentation
npm run docs
```

### Project Structure

```
src/
├── domain/           # Domain entities, value objects, enums
├── application/      # Application services and DTOs
├── infrastructure/   # Repository implementations, external services
└── presentation/     # Vue.js components, views, stores
```

## Development

### Code Style

This project follows the Google TypeScript Style Guide. Run ESLint to check:

```bash
npm run lint
npm run lint:fix
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Documentation

Generate API documentation with TypeDoc:

```bash
npm run docs
```

Documentation will be available in `docs/api/generated/`.

## Architecture Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## License

[Your License]

## Contributing

[Contributing Guidelines]
```

#### `ARCHITECTURE.md`

```markdown
# Architecture Documentation

## Overview

The Cartographic Project Manager (CPM) follows a **Layered Architecture** combined with **Clean Architecture** principles, ensuring separation of concerns, testability, and maintainability.

## Architectural Layers

### 1. Domain Layer (`src/domain/`)

**Responsibility**: Core business logic and rules

**Components**:
- **Entities**: Core business objects (User, Project, Task, Message, etc.)
- **Value Objects**: Immutable objects representing concepts (GeoCoordinates)
- **Enumerations**: Type-safe constants (UserRole, ProjectStatus, TaskStatus, etc.)
- **Repository Interfaces**: Contracts for data persistence

**Key Principles**:
- No dependencies on other layers
- Contains pure business logic
- Framework-agnostic
- Highly testable

### 2. Application Layer (`src/application/`)

**Responsibility**: Application business rules and use cases

**Components**:
- **Service Interfaces**: Define application operations
- **Service Implementations**: Implement business workflows
- **DTOs**: Data Transfer Objects for inter-layer communication

**Key Principles**:
- Depends only on Domain layer
- Orchestrates domain objects
- Implements use cases
- Framework-agnostic

### 3. Infrastructure Layer (`src/infrastructure/`)

**Responsibility**: Technical implementations and external integrations

**Components**:
- **Repository Implementations**: Data persistence logic
- **External Services**: Dropbox, WhatsApp integrations
- **WebSocket**: Real-time communication handlers
- **Database**: Persistence configuration

**Key Principles**:
- Implements interfaces from Domain and Application layers
- Contains framework-specific code
- Handles external dependencies

### 4. Presentation Layer (`src/presentation/`)

**Responsibility**: User interface and user interaction

**Components**:
- **Components**: Reusable Vue.js components
- **Views**: Page-level components
- **Stores**: Pinia state management
- **Composables**: Reusable composition functions
- **Router**: Navigation configuration

**Key Principles**:
- Depends on Application layer services
- Vue.js specific
- Handles user input and display

## Design Patterns

### Repository Pattern
- Abstracts data access
- Interfaces in Domain layer
- Implementations in Infrastructure layer
- Example: `IUserRepository` → `UserRepository`

### Service Layer Pattern
- Encapsulates business logic
- Interfaces in Application layer
- Uses repositories and domain entities
- Example: `IProjectService` → `ProjectService`

### Dependency Injection
- All services receive dependencies via constructor
- Facilitates testing and loose coupling
- Example:
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly dropboxService: IDropboxService
  ) {}

### Factory Pattern
- Creates complex objects
- Used for entities with initialization logic
- Example: Project creation with Dropbox folder

### Observer Pattern
- Real-time notifications
- WebSocket event handling
- Vue.js reactive state management

### Strategy Pattern
- Export formats (CSV, PDF, Excel)
- Backup strategies
- Interchangeable algorithms

### Adapter Pattern
- External service integration
- Dropbox API wrapper
- WhatsApp gateway

## Dependency Flow

Presentation Layer
       ↓
Application Layer
       ↓
  Domain Layer
       ↑
Infrastructure Layer

**Key Rule**: Dependencies point inward. Inner layers know nothing about outer layers.

## Data Flow

1. **User Action** (Presentation Layer)
   ↓
2. **Service Call** (Application Layer)
   ↓
3. **Business Logic** (Domain Layer)
   ↓
4. **Data Persistence** (Infrastructure Layer)
   ↓
5. **External Services** (if needed)

## Testing Strategy

### Unit Tests
- Domain entities and value objects
- Application services (with mocked repositories)
- Utilities and helpers

### Integration Tests
- Service + Repository integration
- External service adapters
- API endpoints

### Component Tests
- Vue.js components
- User interactions
- State management

## Non-Functional Requirements Alignment

- **NFR7**: JWT authentication in Application layer
- **NFR9**: Authorization service validates permissions
- **NFR10-11**: Scalable service architecture
- **NFR12**: WebSocket for real-time notifications
- **NFR17**: Vue.js 3 with Composition API
- **NFR18**: TypeDoc for documentation
- **NFR19**: TaskHistory for audit trail
- **NFR20**: Jest for automated testing

## Future Considerations

- **Microservices**: Current monolithic design can be split by bounded contexts
- **CQRS**: Separate read/write models for complex queries
- **Event Sourcing**: For complete audit trail
- **API Gateway**: For multiple client types
```

## 5. ARCHITECTURAL JUSTIFICATIONS

### Layered Architecture Choice
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Testability**: Layers can be tested independently with mocks
- **Maintainability**: Changes in one layer minimally impact others
- **Scalability**: Easy to scale specific layers independently

### Clean Architecture Principles
- **Independence from Frameworks**: Business logic not tied to Vue.js or any framework
- **Testable**: Business rules testable without UI, database, or external services
- **Independence from UI**: UI can change without affecting business logic
- **Independence from Database**: Can swap persistence mechanisms
- **Independence from External Services**: Business logic doesn't depend on Dropbox/WhatsApp APIs

### TypeScript Benefits
- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and refactoring
- **Self-Documenting**: Types serve as documentation
- **Maintainability**: Easier to refactor with confidence

### Vue.js 3 Composition API
- **Better Code Organization**: Logic grouped by feature, not by option type
- **Type Inference**: Better TypeScript support
- **Reusability**: Composables for shared logic
- **Performance**: Optimized reactivity system

### Pinia Over Vuex
- **TypeScript Support**: Better type inference
- **Simpler API**: No mutations, less boilerplate
- **Composition API Integration**: Natural fit with Vue 3
- **DevTools**: Excellent debugging capabilities
		```

---

## 1.2. Respuesta (NEW) {toggle="true"}
		```markdown
# Cartographic Project Manager - Project Structure Generation

## Project Context
**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously.

**Selected architecture:** Layered Architecture with Clean Architecture principles (Domain → Application Services → Infrastructure → Presentation)

**Technology stack:** TypeScript, HTML, CSS, Vite, TypeDoc, ESLint, Jest, TSJest, Vue.js 3, Socket.io (real-time), Axios (HTTP client), Pinia (state management)

---

## Configuration Files Created

### 1. package.json
Created project dependencies file with all required packages.

### 2. tsconfig.json
TypeScript configuration with strict mode and path aliases.

### 3. tsconfig.node.json
TypeScript configuration for Node.js tooling.

### 4. vite.config.ts
Vite configuration for development and build processes.

### 5. jest.config.js
Jest testing framework configuration with TypeScript support.

### 6. jest.setup.js
Jest setup file for test environment configuration.

### 7. eslint.config.mjs
ESLint configuration following Google Style Guide.

### 8. typedoc.json
TypeDoc configuration for API documentation generation.

### 9. .gitignore
Git ignore patterns for the project.

### 10. index.html
Main HTML entry point for the application.

---

## Domain Layer Structure

### Enumerations Created
- `src/domain/enumerations/user-role.ts` - User role types
- `src/domain/enumerations/project-type.ts` - Project categorization
- `src/domain/enumerations/project-status.ts` - Project lifecycle states
- `src/domain/enumerations/task-status.ts` - Task workflow states
- `src/domain/enumerations/task-priority.ts` - Task priority levels
- `src/domain/enumerations/notification-type.ts` - Notification categories
- `src/domain/enumerations/file-type.ts` - Supported file formats
- `src/domain/enumerations/access-right.ts` - Permission types
- `src/domain/enumerations/index.ts` - Barrel export file

### Value Objects Created
- `src/domain/value-objects/geo-coordinates.ts` - Geographic coordinate representation
- `src/domain/value-objects/index.ts` - Barrel export file

### Entities Created
- `src/domain/entities/user.ts` - User entity
- `src/domain/entities/project.ts` - Project entity
- `src/domain/entities/task.ts` - Task entity
- `src/domain/entities/task-history.ts` - Task audit trail entity
- `src/domain/entities/message.ts` - Message entity
- `src/domain/entities/notification.ts` - Notification entity
- `src/domain/entities/file.ts` - File metadata entity
- `src/domain/entities/permission.ts` - Permission entity
- `src/domain/entities/index.ts` - Barrel export file

### Repository Interfaces Created
- `src/domain/repositories/user-repository.interface.ts` - User data access contract
- `src/domain/repositories/project-repository.interface.ts` - Project data access contract
- `src/domain/repositories/task-repository.interface.ts` - Task data access contract
- `src/domain/repositories/message-repository.interface.ts` - Message data access contract
- `src/domain/repositories/notification-repository.interface.ts` - Notification data access contract
- `src/domain/repositories/file-repository.interface.ts` - File data access contract
- `src/domain/repositories/permission-repository.interface.ts` - Permission data access contract
- `src/domain/repositories/task-history-repository.interface.ts` - Task history data access contract
- `src/domain/repositories/index.ts` - Barrel export file
- `src/domain/index.ts` - Domain layer main export

---

## Application Layer Structure

### DTOs (Data Transfer Objects) Created
- `src/application/dto/auth-result.dto.ts` - Authentication result data
- `src/application/dto/project-data.dto.ts` - Project creation/update data
- `src/application/dto/project-details.dto.ts` - Detailed project information
- `src/application/dto/task-data.dto.ts` - Task creation/update data
- `src/application/dto/message-data.dto.ts` - Message data
- `src/application/dto/file-data.dto.ts` - File upload/download data
- `src/application/dto/export-filters.dto.ts` - Data export filter criteria
- `src/application/dto/export-result.dto.ts` - Export operation result
- `src/application/dto/backup-result.dto.ts` - Backup operation result
- `src/application/dto/validation-result.dto.ts` - Validation result data
- `src/application/dto/index.ts` - Barrel export file

### Service Interfaces Created
- `src/application/interfaces/authentication-service.interface.ts` - Authentication operations
- `src/application/interfaces/project-service.interface.ts` - Project management operations
- `src/application/interfaces/task-service.interface.ts` - Task management operations
- `src/application/interfaces/message-service.interface.ts` - Messaging operations
- `src/application/interfaces/notification-service.interface.ts` - Notification operations
- `src/application/interfaces/file-service.interface.ts` - File management operations
- `src/application/interfaces/authorization-service.interface.ts` - Permission checking operations
- `src/application/interfaces/export-service.interface.ts` - Data export operations
- `src/application/interfaces/backup-service.interface.ts` - Backup/restore operations
- `src/application/interfaces/index.ts` - Barrel export file

### Service Implementations Created
- `src/application/services/authentication.service.ts` - Authentication logic
- `src/application/services/project.service.ts` - Project management logic
- `src/application/services/task.service.ts` - Task management logic
- `src/application/services/message.service.ts` - Messaging logic
- `src/application/services/notification.service.ts` - Notification logic
- `src/application/services/file.service.ts` - File management logic
- `src/application/services/authorization.service.ts` - Authorization logic
- `src/application/services/export.service.ts` - Data export logic
- `src/application/services/backup.service.ts` - Backup/restore logic
- `src/application/services/index.ts` - Barrel export file
- `src/application/index.ts` - Application layer main export

---

## Infrastructure Layer Structure

### Repository Implementations Created
- `src/infrastructure/repositories/user.repository.ts` - User data persistence
- `src/infrastructure/repositories/project.repository.ts` - Project data persistence
- `src/infrastructure/repositories/task.repository.ts` - Task data persistence
- `src/infrastructure/repositories/message.repository.ts` - Message data persistence
- `src/infrastructure/repositories/notification.repository.ts` - Notification data persistence
- `src/infrastructure/repositories/file.repository.ts` - File metadata persistence
- `src/infrastructure/repositories/permission.repository.ts` - Permission data persistence
- `src/infrastructure/repositories/task-history.repository.ts` - Task history persistence
- `src/infrastructure/repositories/index.ts` - Barrel export file

### External Services Created
- `src/infrastructure/external-services/dropbox.service.ts` - Dropbox API integration
- `src/infrastructure/external-services/whatsapp.gateway.ts` - WhatsApp API integration
- `src/infrastructure/external-services/index.ts` - Barrel export file

### WebSocket Handler Created
- `src/infrastructure/websocket/socket.handler.ts` - Real-time communication handler
- `src/infrastructure/websocket/index.ts` - Barrel export file

### HTTP Client Created
- `src/infrastructure/http/axios.client.ts` - Configured HTTP client
- `src/infrastructure/http/index.ts` - Barrel export file
- `src/infrastructure/index.ts` - Infrastructure layer main export

---

## Presentation Layer Structure

### Router Created
- `src/presentation/router/index.ts` - Vue Router configuration

### Pinia Stores Created
- `src/presentation/stores/auth.store.ts` - Authentication state management
- `src/presentation/stores/project.store.ts` - Project state management
- `src/presentation/stores/task.store.ts` - Task state management
- `src/presentation/stores/message.store.ts` - Message state management
- `src/presentation/stores/notification.store.ts` - Notification state management
- `src/presentation/stores/index.ts` - Barrel export file

### Composables Created
- `src/presentation/composables/use-auth.ts` - Authentication composable
- `src/presentation/composables/use-projects.ts` - Project operations composable
- `src/presentation/composables/use-tasks.ts` - Task operations composable
- `src/presentation/composables/use-messages.ts` - Messaging composable
- `src/presentation/composables/use-notifications.ts` - Notifications composable
- `src/presentation/composables/index.ts` - Barrel export file

### Vue Views Created
- `src/presentation/views/LoginView.vue` - Login page
- `src/presentation/views/DashboardView.vue` - Main dashboard
- `src/presentation/views/ProjectListView.vue` - Project list page
- `src/presentation/views/ProjectDetailsView.vue` - Project details page
- `src/presentation/views/CalendarView.vue` - Calendar view page
- `src/presentation/views/NotificationsView.vue` - Notifications page
- `src/presentation/views/BackupView.vue` - Backup management page

### Vue Components Created

#### Common Components
- `src/presentation/components/common/AppHeader.vue` - Application header
- `src/presentation/components/common/AppSidebar.vue` - Navigation sidebar
- `src/presentation/components/common/AppFooter.vue` - Application footer
- `src/presentation/components/common/LoadingSpinner.vue` - Loading indicator

#### Project Components
- `src/presentation/components/project/ProjectCard.vue` - Project card display
- `src/presentation/components/project/ProjectForm.vue` - Project creation/edit form
- `src/presentation/components/project/ProjectSummary.vue` - Project summary widget

#### Task Components
- `src/presentation/components/task/TaskList.vue` - Task list display
- `src/presentation/components/task/TaskCard.vue` - Individual task card
- `src/presentation/components/task/TaskForm.vue` - Task creation/edit form
- `src/presentation/components/task/TaskHistory.vue` - Task change history

#### Message Components
- `src/presentation/components/message/MessageList.vue` - Message list display
- `src/presentation/components/message/MessageBubble.vue` - Individual message bubble
- `src/presentation/components/message/MessageInput.vue` - Message input field

#### Notification Components
- `src/presentation/components/notification/NotificationList.vue` - Notification list
- `src/presentation/components/notification/NotificationItem.vue` - Individual notification

#### File Components
- `src/presentation/components/file/FileUploader.vue` - File upload component
- `src/presentation/components/file/FileList.vue` - File list display

#### Calendar Components
- `src/presentation/components/calendar/CalendarWidget.vue` - Calendar widget

### Styles Created
- `src/presentation/styles/variables.css` - CSS custom properties
- `src/presentation/styles/main.css` - Global styles
- `src/presentation/index.ts` - Presentation layer main export

---

## Shared Utilities

### Shared Files Created
- `src/shared/constants.ts` - Application-wide constants
- `src/shared/utils.ts` - Utility functions
- `src/shared/index.ts` - Barrel export file

---

## Entry Point Files

### Application Entry
- `src/main.ts` - Application entry point
- `src/App.vue` - Root Vue component
- `src/vite-env.d.ts` - Vite environment type definitions

---

## Test Structure

### Test Infrastructure
- `tests/__mocks__/styleMock.js` - CSS module mock
- `tests/__mocks__/fileMock.js` - File import mock

### Test Scaffolds
- `tests/domain/entities/entities.test.ts` - Domain entity tests
- `tests/domain/value-objects/value-objects.test.ts` - Value object tests
- `tests/application/services/services.test.ts` - Service tests
- `tests/infrastructure/repositories/repositories.test.ts` - Repository tests
- `tests/infrastructure/external-services/external-services.test.ts` - External service tests
- `tests/presentation/stores/stores.test.ts` - Store tests
- `tests/presentation/components/components.test.ts` - Component tests
- `tests/presentation/views/views.test.ts` - View tests

---

## Documentation

### Documentation Files Created
- `README.md` - Project overview and setup instructions
- `docs/ARCHITECTURE.md` - Architectural design documentation

---

## Initialization Script

### Setup Script Created
- `initialization.sh` - Project initialization and dependency installation script

---

## Project Statistics

**Total Files Created:** 150

### File Distribution by Layer

| Layer | Contents | Files |
|-------|----------|-------|
| **Config** | package.json, tsconfig, vite, eslint, jest, typedoc, .gitignore, index.html | 10 |
| **Domain** | 8 entities, 8 enums, 1 value object, 8 repository interfaces + barrels | 28 |
| **Application** | 10 DTOs, 9 service interfaces, 9 service implementations + barrels | 31 |
| **Infrastructure** | 8 repositories, 2 external services, 1 WebSocket handler, 1 HTTP client + barrels | 17 |
| **Presentation** | 7 views, 19 components, 5 stores, 5 composables, router, 2 CSS files + barrels | 41 |
| **Shared** | constants.ts, utils.ts + barrel | 3 |
| **Entry** | main.ts, App.vue, vite-env.d.ts | 3 |
| **Tests** | 8 test scaffolds + 2 mock files | 10 |
| **Docs** | README.md, ARCHITECTURE.md | 2 |
| **Scripts** | initialization.sh | 1 |

---

## Architectural Compliance

All files follow the specified conventions:

### Clean Architecture Principles
- **Clean Architecture** with inward dependency flow (Domain ← Application ← Infrastructure, Presentation → Application)
- Repository interfaces in Domain layer
- Service interfaces in Application layer
- Infrastructure implementations depend on abstractions (Dependency Inversion Principle)

### Technology Standards
- **TypeScript** with strict mode enabled
- **Path aliases** configured: `@domain`, `@application`, `@infrastructure`, `@presentation`, `@shared`
- **Vue 3 Composition API** (`<script setup lang="ts">`) for all components
- **Pinia** setup syntax for state management stores

### Design Patterns Applied
- **Repository Pattern**: Data access abstraction for all entities
- **Service Layer Pattern**: Business logic encapsulation
- **Factory Pattern**: Complex entity creation
- **Observer Pattern**: Real-time notifications via WebSockets
- **Strategy Pattern**: Export formats and backup strategies
- **Dependency Injection**: Constructor-based dependency injection
- **Adapter Pattern**: External service integration (Dropbox, WhatsApp)
- **Singleton Pattern**: Configuration and session management

### Code Quality Standards
- **Google Style Guide** compliance (2-space indent, single quotes, `I` prefix for interfaces)
- All methods declared with `throw new Error('Not implemented.')` stubs
- **JSDoc comments** documenting responsibilities on every module
- Consistent nomenclature following UML class diagram
- Prepared for testing from the start

---

## Next Steps

To initialize the project, run:

```bash
chmod +x initialization.sh
./initialization.sh
```

This script will:
1. Install all npm dependencies
2. Set up the development environment
3. Configure git hooks (if applicable)
4. Verify the project structure

After initialization, you can:
- Run `npm run dev` - Start development server
- Run `npm run build` - Build for production
- Run `npm run test` - Run test suite
- Run `npm run lint` - Lint code
- Run `npm run docs` - Generate API documentation
		```