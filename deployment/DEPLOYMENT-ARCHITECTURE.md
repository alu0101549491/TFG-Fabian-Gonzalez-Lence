# Deployment Architecture - The Hangman Game

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Developer Workflow"
        A[Developer] -->|Push Code| B[GitHub Repository]
        A -->|Manual Trigger| C[GitHub Actions]
    end
    
    subgraph "GitHub Repository - Mono-Repo"
        B -->|projects/1-TheHangmanGame/| D[Hangman Project]
        B -->|projects/2-MusicWebPlayer/| E[Other Projects]
        B -->|.github/workflows/| F[Workflow Files]
    end
    
    subgraph "CI/CD Pipeline"
        D -->|Monitors Changes| G[Deploy Workflow]
        F -->|Contains| G
        G -->|Step 1| H[Checkout Code]
        H -->|Step 2| I[Setup Node.js]
        I -->|Step 3| J[Install Dependencies]
        J -->|Step 4| K[Quality Checks]
        K -->|Step 5| L[Build Production]
        L -->|Step 6| M[Upload Artifacts]
        M -->|Step 7| N[Deploy to Pages]
    end
    
    subgraph "Quality Checks"
        K --> K1[ESLint]
        K --> K2[TypeScript Check]
        K --> K3[Jest Tests]
    end
    
    subgraph "Build Process"
        L --> L1[TypeScript Compile]
        L --> L2[Vite Bundle]
        L --> L3[Asset Optimization]
        L1 --> L4[dist/ Output]
        L2 --> L4
        L3 --> L4
    end
    
    subgraph "GitHub Pages"
        N -->|Deploys to| O[GitHub Pages Server]
        O -->|Serves at| P[https://username.github.io/repo/1-TheHangmanGame/]
    end
    
    subgraph "End Users"
        P -->|Access via| Q[Web Browsers]
        Q --> Q1[Desktop]
        Q --> Q2[Mobile]
        Q --> Q3[Tablet]
    end
    
    style A fill:#e1f5ff
    style G fill:#fff4e1
    style L fill:#ffe1e1
    style N fill:#e1ffe1
    style P fill:#f0e1ff
    style Q fill:#e1ffe1
```

## Deployment Flow Sequence

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git Repository
    participant GHA as GitHub Actions
    participant Build as Build System
    participant Pages as GitHub Pages
    participant User as End User
    
    Dev->>Git: Push changes to main
    Git->>GHA: Trigger deploy-hangman.yml
    GHA->>GHA: Checkout code
    GHA->>GHA: Setup Node.js 20.x
    GHA->>GHA: Install dependencies (npm ci)
    
    GHA->>Build: Run quality checks
    Build->>Build: ESLint validation
    Build->>Build: TypeScript type check
    Build->>Build: Jest tests with coverage
    
    GHA->>Build: Execute production build
    Build->>Build: Compile TypeScript
    Build->>Build: Bundle with Vite
    Build->>Build: Optimize assets
    Build->>Build: Generate dist/ folder
    
    Build->>GHA: Build artifacts ready
    GHA->>Pages: Upload artifacts
    GHA->>Pages: Deploy to GitHub Pages
    Pages->>Pages: Publish to CDN
    
    Pages-->>GHA: Deployment successful
    GHA-->>Dev: Notification (success/failure)
    
    User->>Pages: Request application
    Pages->>User: Serve static files
    User->>User: Run application in browser
```

## Mono-Repo Structure

```mermaid
graph LR
    subgraph "Repository Root"
        A[.github/workflows/]
        B[projects/]
        C[chats/]
        D[docs/]
    end
    
    subgraph "Projects Directory"
        B --> E[1-TheHangmanGame/]
        B --> F[2-MusicWebPlayer/]
        B --> G[3-OtherProjects/]
    end
    
    subgraph "Hangman Project Structure"
        E --> H[src/]
        E --> I[tests/]
        E --> J[public/]
        E --> K[dist/]
        E --> L[Configuration Files]
    end
    
    subgraph "Workflow Files"
        A --> M[deploy-hangman.yml]
        A --> N[deploy-player.yml]
        A --> O[ci.yml]
    end
    
    M -.->|Monitors| E
    M -.->|Deploys| K
    
    style E fill:#ffe1e1
    style M fill:#e1ffe1
    style K fill:#e1f5ff
```

## Build and Deployment Pipeline

```mermaid
graph LR
    subgraph "Source Code"
        A[TypeScript .ts] -->|tsc| B[JavaScript .js]
        C[CSS .css] -->|Vite| D[Bundled CSS]
        E[Assets] -->|Vite| F[Optimized Assets]
    end
    
    subgraph "Vite Build Process"
        B --> G[Bundle JavaScript]
        D --> G
        F --> G
        G --> H[Tree Shaking]
        H --> I[Minification]
        I --> J[Code Splitting]
        J --> K[Hash File Names]
    end
    
    subgraph "Output"
        K --> L[dist/index.html]
        K --> M[dist/assets/*.js]
        K --> N[dist/assets/*.css]
        K --> O[dist/favicon.ico]
    end
    
    subgraph "Deployment"
        L --> P[GitHub Pages]
        M --> P
        N --> P
        O --> P
    end
    
    P --> Q[CDN Distribution]
    Q --> R[Global Availability]
```

## Environment Configuration Flow

```mermaid
graph TB
    A[Development] -->|npm run dev| B[Local Server :3000]
    A -->|npm run build| C{Environment Check}
    
    C -->|BASE_URL not set| D[Build with base: '/']
    C -->|BASE_URL set| E[Build with base: '/1-TheHangmanGame/']
    
    D --> F[Local Production Build]
    E --> G[GitHub Pages Build]
    
    F -->|npm run preview| H[Preview Server :4173]
    G --> I[GitHub Actions Deploy]
    
    I --> J[GitHub Pages]
    J --> K[Live Site]
    
    style A fill:#e1f5ff
    style C fill:#fff4e1
    style I fill:#ffe1e1
    style K fill:#e1ffe1
```

## Multi-Project Deployment Strategy

```mermaid
graph TB
    subgraph "Repository"
        A[Main Branch]
    end
    
    subgraph "Change Detection"
        A -->|Changes in| B[projects/1-TheHangmanGame/]
        A -->|Changes in| C[projects/2-MusicWebPlayer/]
        A -->|Changes in| D[projects/3-Other/]
    end
    
    subgraph "Workflow Triggers"
        B --> E[deploy-hangman.yml]
        C --> F[deploy-player.yml]
        D --> G[deploy-other.yml]
    end
    
    subgraph "Parallel Deployments"
        E --> H[Deploy Hangman]
        F --> I[Deploy Player]
        G --> J[Deploy Other]
    end
    
    subgraph "GitHub Pages URLs"
        H --> K[/1-TheHangmanGame/]
        I --> L[/2-MusicWebPlayer/]
        J --> M[/3-Other/]
    end
    
    K --> N[github.io/repo/]
    L --> N
    M --> N
    
    style E fill:#ffe1e1
    style F fill:#e1ffe1
    style G fill:#e1f5ff
```

## Asset Loading Architecture

```mermaid
graph LR
    subgraph "Browser Request"
        A[User visits site] --> B[Request index.html]
    end
    
    subgraph "Initial Load"
        B --> C[GitHub Pages CDN]
        C --> D[Serve index.html]
        D --> E[Parse HTML]
    end
    
    subgraph "Asset Requests"
        E --> F[Request CSS]
        E --> G[Request JavaScript]
        E --> H[Request Assets]
    end
    
    subgraph "Base Path Resolution"
        F --> I[Hangman Assets CSS]
        G --> J[Hangman Assets JS]
        H --> K[Hangman ICO]
    end
    
    subgraph "CDN Response"
        I --> L[Serve from CDN]
        J --> L
        K --> L
    end
    
    L --> M[Render Application]
    M --> N[Interactive Game]
    
    style A fill:#e1f5ff
    style M fill:#ffe1e1
    style N fill:#e1ffe1
```

## Error Handling Flow

```mermaid
graph TB
    A[Deployment Triggered] --> B{Quality Checks}
    
    B -->|Lint Error| C[Continue with Warning]
    B -->|Type Error| D[Fail Build]
    B -->|Test Failure| E[Continue with Warning]
    B -->|All Pass| F[Proceed to Build]
    
    C --> F
    E --> F
    
    F --> G{Build Process}
    
    G -->|Build Success| H[Upload Artifacts]
    G -->|Build Failure| I[Notify Developer]
    
    H --> J{Deploy Process}
    
    J -->|Deploy Success| K[Update Live Site]
    J -->|Deploy Failure| L[Rollback/Notify]
    
    I --> M[Check Logs]
    L --> M
    
    M --> N[Fix Issues]
    N --> A
    
    style D fill:#ffe1e1
    style I fill:#ffe1e1
    style L fill:#ffe1e1
    style K fill:#e1ffe1
```

## Caching and CDN Strategy

```mermaid
graph TB
    subgraph "Build Output"
        A[index.html] --> B[No Cache Headers]
        C[assets/*.js] --> D[Cache with Hash]
        E[assets/*.css] --> D
        F[favicon.ico] --> D
    end
    
    subgraph "GitHub Pages CDN"
        B --> G[Always Fresh]
        D --> H[Long Cache Duration]
    end
    
    subgraph "User Browser"
        G --> I[Check for Updates]
        H --> J[Serve from Cache]
    end
    
    subgraph "Cache Busting"
        I --> K[New Deployment?]
        K -->|Yes| L[Download New Files]
        K -->|No| M[Use Cached]
        
        L --> N[Hash Changed?]
        N -->|Yes| O[Download New Assets]
        N -->|No| J
    end
    
    O --> P[Update Application]
    J --> P
    M --> P
    
    style G fill:#ffe1e1
    style H fill:#e1ffe1
```

---

## Key Architecture Principles

1. **Isolation**: Each project in the mono-repo is independent
2. **Automation**: Deployments are fully automated via GitHub Actions
3. **Quality**: Built-in quality gates before deployment
4. **Optimization**: Production builds are optimized for performance
5. **Reliability**: Error handling and rollback capabilities
6. **Scalability**: Easy to add more projects to the mono-repo
7. **Monitoring**: Full visibility into deployment process
8. **Security**: Minimal permissions, HTTPS by default

## Technology Stack

- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Build Tool**: Vite
- **Language**: TypeScript
- **Testing**: Jest
- **Linting**: ESLint
- **Hosting**: GitHub Pages
- **CDN**: GitHub's Global CDN