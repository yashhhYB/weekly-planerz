# Weekly Planner System

## Overview

Production-grade Weekly Planning system with strict server-side business rule enforcement and automated CI/CD deployment.

**Technology Stack:**
- Backend: ASP.NET Core 8 (Clean Architecture + CQRS)
- Frontend: Angular 17 (Standalone Components)  
- Database: PostgreSQL
- Testing: 100% Code Coverage (Enforced)
- CI/CD: GitHub Actions
- Deployment: Azure (App Service + Static Web App)

---

## Domain Model

**Planning Lifecycle:**
1. Backlog items created with category and estimated hours
2. Planning week created (Tuesday only, strict validation)
3. Team lead defines category percentages (must sum to 100%)
4. Members allocate hours to items from backlog
5. Planning frozen (immutable state enforcement)
6. Team lead dashboard tracks progress and metrics

**Business Rules (Server-Side Enforced):**
- ✅ Tuesday-only planning creation (validated in constructor)
- ✅ 30-hour allocation per member (strictly enforced)
- ✅ Category percentages must equal 100% (±0.01 tolerance)
- ✅ Category hour limits per member enforced
- ✅ Freeze state immutability (modifications blocked after freeze)
- ✅ Backlog items: ClientFocused, TechDebt, RnD categories

---

## Architecture

```
Angular 17 SPA (Standalone Components)
                ↓
ASP.NET Core 8 API (Clean Architecture)
                ↓
PostgreSQL Database
```

**Backend Layers:**
- **Domain:** Business entities, enums, domain services (zero dependencies)
- **Application:** Commands, Queries, Validators (MediatR)
- **Infrastructure:** DbContext, Repositories, Unit of Work
- **API:** Controllers, Middleware, Health Checks

**Frontend:**
- Standalone Components
- Reactive Forms with validation
- Typed HTTP Services
- Responsive UI with dark mode

---

## Repository Structure

```
weekly-planner/
│
├── .github/
│   ├── workflows/
│   │   ├── backend-ci.yml        # .NET build, test, coverage
│   │   ├── frontend-ci.yml       # Node lint, test, build  
│   │   ├── quality-gate.yml      # PR validation gate
│   │   └── deploy.yml            # Azure deployment
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── backend/
│   ├── src/
│   │   ├── WeeklyPlanner.Domain/        # Core business logic
│   │   ├── WeeklyPlanner.Application/   # Use cases (CQRS)
│   │   ├── WeeklyPlanner.Infrastructure/# Data access
│   │   └── WeeklyPlanner.API/           # HTTP endpoints
│   ├── tests/
│   │   └── WeeklyPlanner.UnitTests/     # 100% coverage
│   ├── WeeklyPlanner.sln
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   └── app/                  # Angular application
│   ├── e2e/                      # End-to-end tests
│   └── Dockerfile
│
├── docs/
│   ├── architecture.md           # System design
│   ├── business-rules.md         # Domain rules with tests
│   ├── api-contract.md           # REST API specification
│   └── decisions.md              # Architecture Decision Records
│
├── scripts/
│   ├── dev-setup.ps1             # Windows setup automation
│   ├── dev-setup.sh              # Unix setup automation
│   └── seed-data.sql             # Test data
│
├── docker-compose.yml            # Local PostgreSQL
├── .editorconfig                 # Code style enforcement
├── .gitignore
├── README.md
└── LICENSE
```

---

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- PostgreSQL 16 (or Docker)
- Git

### Backend Setup

```bash
cd backend
dotnet restore
dotnet build
dotnet test
dotnet run
```

API: `http://localhost:5000/swagger`

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

App: `http://localhost:4200`

### Database (Docker)

```bash
docker-compose up -d db
# PostgreSQL on localhost:5432
# User: planner | Password: planner
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow | Trigger | Purpose | Fail Condition |
|----------|---------|---------|----------------|
| backend-ci.yml | `push`, `pull_request` on backend/ | Compile, test, coverage | Coverage < 100% |
| frontend-ci.yml | `push`, `pull_request` on frontend/ | Lint, test, build | Tests fail or lint errors |
| quality-gate.yml | `pull_request` | Format & description validation | Invalid PR format |
| deploy.yml | `push` to main | Deploy to Azure | Backend or frontend deployment fails |

### Coverage Enforcement

Backend CI requires **100% code coverage** - pipeline fails if threshold not met:

```bash
dotnet test /p:CollectCoverage=true \
  /p:CoverletOutputFormat=opencover \
  /p:Threshold=100
```

---

## Testing Strategy

**Backend: 100% Unit Test Coverage**
```bash
cd backend
dotnet test
```

**Frontend: Unit Tests**
```bash
cd frontend
npm run test -- --code-coverage
```

Both test suites run automatically in CI pipeline.

---

## Development Workflow

1. Create feature branch from `develop`
2. Make changes and commit with conventional commits
3. Push to remote (CI runs automatically)
4. All checks must pass before merge
5. Create PR to `develop` 
6. After code review, merge to `develop`
7. When feature complete, create PR `develop` → `main`
8. Merge to main (triggers Azure deployment)

**Commit Convention:**
```
feat: Add feature description
test: Add unit tests
fix: Bug fix with explanation
docs: Documentation updates
refactor: Code improvements
```

---

## Engineering Principles

- **Clean Architecture:** Strict layer separation, dependencies point inward
- **Domain-Driven Design:** Business logic isolated in Domain layer
- **CQRS Pattern:** Commands and Queries separated via MediatR
- **Server-Side Validation:** All business rules enforced in backend
- **Immutable State:** Frozen planning state cannot be modified
- **100% Test Coverage:** Enforced by CI pipeline
- **Convention over Configuration:** Sensible defaults, minimal boilerplate

---

## Deployment

### GitHub Secrets Required

```
AZURE_BACKEND_PUBLISH_PROFILE    # Azure App Service deployment
AZURE_STATIC_WEB_APP_TOKEN       # Azure Static Web App token
```

### Deployment Targets
- **Backend:** Azure App Service (.NET 8)
- **Frontend:** Azure Static Web App (Angular)  
- **Database:** Azure Database for PostgreSQL

---

## Documentation

- **[Architecture](docs/architecture.md)** - System design, layer responsibilities
- **[Business Rules](docs/business-rules.md)** - Domain rules with test examples
- **[API Contract](docs/api-contract.md)** - REST endpoint specifications
- **[Decisions](docs/decisions.md)** - Architecture Decision Records (ADRs)

---

## Code Quality

- C# StyleCop enforced
- ESLint + Prettier for JavaScript/TypeScript
- .editorconfig for consistency
- Global exception middleware for error handling
- Structured logging with Serilog
- HTTPS enforced in production
- CORS configured for frontend origin

---

## Health Check Endpoint

```bash
GET /health
```

Response: `{ "status": "healthy" }`

---

## Engineering Standards

✅ Clean Architecture  
✅ SOLID Principles  
✅ Conventional Commits  
✅ 100% Test Coverage (Enforced)  
✅ Code Style Enforcement  
✅ Automated Testing  
✅ Automated Deployment  
✅ Structured Logging

---

## License

Proprietary - All rights reserved
