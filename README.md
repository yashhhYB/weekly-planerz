# Weekly Planerz

**A production-grade weekly planning system for engineering teams.**
Plan sprints, allocate hours across categories, track progress, and keep your team in sync — all with strict server-side business rule enforcement.

| | |
|---|---|
| **Frontend** | [orange-meadow-0bc016403.4.azurestaticapps.net](https://orange-meadow-0bc016403.4.azurestaticapps.net) |
| **Backend API** | [weeklyplanner-api.azurewebsites.net](https://weeklyplanner-api.azurewebsites.net) |
| **Swagger** | [weeklyplanner-api.azurewebsites.net/swagger](https://weeklyplanner-api.azurewebsites.net/swagger) |
| **Health** | [weeklyplanner-api.azurewebsites.net/health](https://weeklyplanner-api.azurewebsites.net/health) |

---

## Table of Contents

1. [Problem](#problem)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [API Design](#api-design)
6. [Domain Model](#domain-model)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Testing](#testing)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Deployment](#deployment)
12. [Screenshots](#screenshots)

---

## Problem

Engineering teams struggle with weekly sprint planning. Common pain points:

| Pain Point | How Weekly Planerz Solves It |
|---|---|
| No structured allocation process | Enforced category-based hour allocation (Client, Tech Debt, R&D) |
| Overcommitment | Hard 30-hour cap per member per week |
| Inconsistent planning cadence | Tuesday-only week creation (domain-enforced) |
| No visibility into team progress | Real-time dashboard with per-member and per-category breakdowns |
| Uncontrolled mid-sprint changes | Freeze mechanism locks plans before execution |
| Leads and members see the same view | Role-based dashboards — leads manage, members execute |

---

## Architecture

```
                    +----------------------------+
                    |     Angular 17 SPA         |
                    |  Standalone Components     |
                    |  NgRx State Management     |
                    +------------+---------------+
                                 |
                           HTTPS / REST
                                 |
                    +------------v---------------+
                    |   ASP.NET Core 8 Web API   |
                    |   Clean Architecture       |
                    |   CQRS via MediatR         |
                    +------------+---------------+
                                 |
                    +------------v---------------+
                    |   SQLite (dev) / PostgreSQL |
                    |   EF Core 8 + Migrations   |
                    +----------------------------+
```

### Backend Layers

| Layer | Responsibility | Dependencies |
|---|---|---|
| **Domain** | Entities, enums, business rules | None (pure C#) |
| **Application** | Commands, queries, validators | MediatR, FluentValidation |
| **Infrastructure** | DbContext, repositories, migrations | EF Core, Serilog |
| **API** | Controllers, middleware, health checks | Swashbuckle, Serilog |

### Frontend Layers

| Layer | Responsibility |
|---|---|
| **Features** | Page components (planning, backlog, team, home) |
| **Core** | Services, interceptors, guards |
| **Store** | NgRx actions, reducers, effects, selectors |
| **Shared** | Reusable components (toast notifications) |
| **Models** | TypeScript interfaces and enums |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| .NET | 8.0 | Runtime |
| ASP.NET Core | 8.0 | Web API framework |
| MediatR | 12.0.1 | CQRS pattern |
| FluentValidation | 11.8.0 | Request validation |
| EF Core | 8.0 | ORM + migrations |
| SQLite | — | Local development database |
| PostgreSQL | 16 | Production database |
| Serilog | 7.0.0 | Structured logging |
| Swashbuckle | 6.0.0 | Swagger / OpenAPI docs |
| xUnit | 2.6.4 | Unit testing |
| Moq | 4.20.70 | Mocking framework |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 17 | SPA framework |
| TypeScript | ~5.2.2 | Type-safe JavaScript |
| NgRx | 17.2.0 | State management |
| RxJS | ~7.8.0 | Reactive programming |
| Zone.js | ~0.14.0 | Change detection |
| Karma + Jasmine | — | Unit testing |
| ESLint | — | Linting |

### Infrastructure

| Technology | Purpose |
|---|---|
| GitHub Actions | CI/CD pipelines |
| Azure Static Web Apps | Frontend hosting |
| Azure App Service | Backend hosting |
| Azure Database for PostgreSQL | Production database |
| Docker + Docker Compose | Local containerized development |

---

## Features

### Planning Lifecycle

| Step | Actor | Description |
|---|---|---|
| 1 | Lead | Creates a planning week (Tuesdays only) |
| 2 | Lead | Sets category allocation percentages (must sum to 100%) |
| 3 | Members | Allocate hours to backlog items (max 30 hrs/member) |
| 4 | Lead | Reviews allocations and freezes the week |
| 5 | Lead | Starts the week (moves to In Progress) |
| 6 | Members | Log actual hours and update progress |
| 7 | Lead | Completes or archives the week |

### Business Rules (Server-Side Enforced)

| Rule | Enforcement |
|---|---|
| Tuesday-only week creation | Validated in `PlanningWeek` constructor |
| 30-hour allocation cap per member | Enforced in `WeekMember.Submit()` |
| Category percentages sum to 100% | Validated with ±0.01 tolerance |
| Freeze immutability | No modifications allowed after freeze |
| Status transitions | `Setup` → `InProgress` → `Completed` → `Archived` |
| Backlog categories | `ClientFocused`, `TechDebt`, `RnD` |

### Role-Based Access

| Feature | Lead | Member |
|---|---|---|
| Create/edit planning weeks | Yes | No |
| Set category percentages | Yes | No |
| Freeze/start/complete weeks | Yes | No |
| View team dashboard | Yes | Read-only |
| Allocate own hours | Yes | Yes |
| Update own progress | Yes | Yes |
| Create backlog items | Yes | Yes |
| Edit/archive backlog items | Yes | No |

### UI Capabilities

| Feature | Description |
|---|---|
| Dark / Light theme | Toggleable with persistent preference |
| Role switcher | Switch between Lead and Member views |
| Toast notifications | Success, error, and warning messages |
| Responsive layout | Works on desktop and tablet |
| Slider-based allocation | Visual category percentage sliders |
| Post-freeze dashboard | Separate card grids for lead vs member |
| Past weeks archive | Browse and review completed weeks |

---

## API Design

All endpoints return a consistent `ApiResponse<T>` envelope:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { },
  "errors": [],
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Planning — `api/Planning`

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | List all planning weeks |
| `GET` | `/{id}` | Get week by ID |
| `POST` | `/` | Create new planning week |
| `PUT` | `/{id}` | Update week details |
| `DELETE` | `/{id}` | Delete a planning week |
| `POST` | `/{id}/freeze` | Freeze the week |
| `POST` | `/{id}/start` | Start the week |
| `POST` | `/{id}/complete` | Complete the week |
| `POST` | `/{id}/archive` | Archive the week |
| `GET` | `/{weekId}/members` | List week members |
| `POST` | `/{weekId}/members` | Add member to week |
| `DELETE` | `/{weekId}/members/{memberId}` | Remove member from week |
| `POST` | `/{weekId}/members/{memberId}/tasks` | Assign task to member |
| `DELETE` | `/{weekId}/members/{memberId}/tasks/{taskId}` | Remove task |
| `POST` | `/{weekId}/members/{memberId}/submit` | Submit member plan |
| `POST` | `/{weekId}/members/{memberId}/unsubmit` | Unsubmit member plan |
| `PUT` | `/{weekId}/members/{memberId}/tasks/{taskId}/progress` | Update task progress |
| `GET` | `/{weekId}/dashboard` | Get week dashboard data |

### Backlog — `api/Backlog`

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | List all backlog items |
| `GET` | `/{id}` | Get item by ID |
| `GET` | `/active` | List non-archived items |
| `POST` | `/` | Create backlog item |
| `PUT` | `/{id}` | Update backlog item |
| `DELETE` | `/{id}` | Delete backlog item |
| `POST` | `/{id}/archive` | Archive backlog item |

### Team — `api/Team`

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | List all team members |
| `GET` | `/{id}` | Get member by ID |
| `POST` | `/` | Create team member |
| `PUT` | `/{id}` | Update member name |
| `DELETE` | `/{id}` | Delete team member |
| `PUT` | `/{id}/role` | Change member role |

### Admin — `api/Admin`

| Method | Route | Description |
|---|---|---|
| `GET` | `/export` | Export all data as JSON |
| `POST` | `/import` | Import data from JSON |
| `POST` | `/seed` | Seed sample data |
| `POST` | `/reset` | Reset entire database |

### Health

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Returns status, timestamp, environment |

---

## Domain Model

### Entity Relationships

```
PlanningWeek ──< WeekMember ──< MemberTask >── BacklogItem
                     │
                TeamMember
```

### Entities

| Entity | Key Properties | Business Logic |
|---|---|---|
| `PlanningWeek` | Status, IsFrozen, ClientPercent, TechDebtPercent, RndPercent | Percentages must sum to 100%. Status: Setup → InProgress → Completed → Archived |
| `TeamMember` | Name, Role (Member / Lead) | Role-based access control throughout the system |
| `WeekMember` | TotalPlannedHours, TotalActualHours, HasSubmitted | 30-hour cap enforced on submit. Auto-recalculates from tasks |
| `MemberTask` | PlannedHours, ActualHours, ProgressPercent | Links a WeekMember to a BacklogItem with hour tracking |
| `BacklogItem` | Title, Category, EstimatedHours, IsArchived | Categories: ClientFocused (1), TechDebt (2), RnD (3) |

### Enums

| Enum | Values |
|---|---|
| `PlanningStatus` | `Setup = 1`, `InProgress = 2`, `Completed = 3`, `Archived = 4` |
| `UserRole` | `TeamMember = 1`, `TeamLead = 2`, `Admin = 3` |
| `BacklogCategory` | `ClientFocused = 1`, `TechDebt = 2`, `RnD = 3` |

---

## Project Structure

```
weekly-planerz/
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/
│       ├── backend-ci.yml            # Backend CI (push/PR)
│       ├── frontend-ci.yml           # Frontend CI (push/PR)
│       ├── quality-gate.yml          # PR quality checks
│       └── deploy.yml                # Azure deployment
│
├── backend/
│   ├── WeeklyPlanner.sln
│   ├── Dockerfile
│   ├── WeeklyPlanner.Domain/         # Entities, enums (zero deps)
│   ├── WeeklyPlanner.Application/    # CQRS commands, queries, validators
│   ├── WeeklyPlanner.Infrastructure/ # EF Core, repositories, migrations
│   ├── WeeklyPlanner.API/            # Controllers, middleware, Program.cs
│   ├── WeeklyPlanner.Tests/          # xUnit unit tests
│   └── WeeklyPlanner.IntegrationTests/
│
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                 # Services (8), interceptors
│   │   │   ├── features/             # Planning (9), backlog (3), team (2)
│   │   │   ├── home/                 # Role-based dashboard
│   │   │   ├── shared/               # Toast component
│   │   │   ├── store/                # NgRx (planning, backlog, team)
│   │   │   └── models/               # TypeScript interfaces & enums
│   │   ├── assets/                   # SVG favicon
│   │   └── environments/             # Dev & prod API configs
│   └── karma.conf.js
│
├── docker-compose.yml                # PostgreSQL + API + Web
├── staticwebapp.config.json          # Azure SWA routing
├── docs/                             # Architecture & business rules docs
├── diagrams/                         # System diagrams
├── scripts/                          # Deploy & setup scripts
└── tests/                            # Integration & E2E test stubs
```

### Codebase Metrics

| Area | Count |
|---|---|
| Frontend TypeScript files | 81 |
| Frontend unit tests | 278 |
| Backend projects | 6 |
| Backend unit tests | 9 |
| API endpoints | 32 |
| NgRx store files | 24 |
| CI/CD workflows | 4 |

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 8.0+ |
| Node.js | 20+ |
| npm | 10+ |
| Git | 2.x |
| Docker (optional) | 20+ |

### Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project WeeklyPlanner.API/
```

> API: `http://localhost:5000` | Swagger: `http://localhost:5000/swagger`

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
ng serve
```

> App: `http://localhost:4200`

### Docker (Full Stack)

```bash
docker-compose up -d
```

| Service | URL | Port |
|---|---|---|
| Frontend | `http://localhost:4200` | 4200 |
| Backend API | `http://localhost:5000` | 5000 |
| PostgreSQL | `localhost:5432` | 5432 |

### Seed Sample Data

Once both services are running, hit the seed endpoint:

```bash
curl -X POST http://localhost:5000/api/Admin/seed
```

---

## Testing

### Run Tests

```bash
# Backend
cd backend && dotnet test

# Frontend (single run)
cd frontend && npm run test -- --watch=false --browsers=ChromeHeadless

# Frontend (with coverage)
cd frontend && npm run test -- --code-coverage
```

### Test Infrastructure

| | Backend | Frontend |
|---|---|---|
| Framework | xUnit 2.6.4 | Jasmine |
| Runner | `dotnet test` | Karma |
| Mocking | Moq 4.20.70 | Jasmine spies |
| Browser | — | Chrome / ChromeHeadless |
| Coverage output | — | `coverage/weekly-planner/` |

### Current Status

| Suite | Tests | Status |
|---|---|---|
| Frontend unit tests | 278 | Passing |
| Backend unit tests | 9 | Passing |
| Quality gate (CI) | All | Enforced on every PR |

---

## CI/CD Pipeline

### Workflows

| Workflow | Trigger | Steps |
|---|---|---|
| `backend-ci.yml` | Push/PR on `backend/**` | Restore → Build (Release) → Test |
| `frontend-ci.yml` | Push/PR on `frontend/**` | Install → Lint → Build (prod) → Test |
| `quality-gate.yml` | PR to `main` / `develop` | Backend build (warnings=errors) + Frontend full check |
| `deploy.yml` | Push to `main` | Deploy frontend → Azure SWA, backend → Azure App Service |

### Quality Gate Rules

| Check | Fails If |
|---|---|
| Backend build | Any compiler warning |
| Backend tests | Any test failure |
| Frontend lint | ESLint violations |
| Frontend build | Production build errors |
| Frontend tests | Any test failure |

### Deployment Pipeline

```
Push to main
    │
    ├─ deploy-frontend
    │   ├── npm ci --legacy-peer-deps
    │   └── Azure Static Web Apps deploy (dist/weekly-planner)
    │
    └─ deploy-backend
        ├── dotnet restore → build → test
        ├── dotnet publish (Release)
        ├── Azure login (service principal)
        └── Azure Web App deploy (weeklyplanner-api)
```

---

## Deployment

### Azure Resources

| Resource | Type | Name |
|---|---|---|
| Resource Group | Resource Group | `weekly-planner-rg` |
| Frontend | Azure Static Web Apps | `weeklyplanner-web` |
| Backend | Azure App Service | `weeklyplanner-api` |
| Database | Azure Database for PostgreSQL | Flexible Server |

### Live URLs

| Service | URL |
|---|---|
| Frontend | [https://orange-meadow-0bc016403.4.azurestaticapps.net](https://orange-meadow-0bc016403.4.azurestaticapps.net) |
| Backend API | [https://weeklyplanner-api.azurewebsites.net](https://weeklyplanner-api.azurewebsites.net) |
| Swagger Docs | [https://weeklyplanner-api.azurewebsites.net/swagger](https://weeklyplanner-api.azurewebsites.net/swagger) |
| Health Check | [https://weeklyplanner-api.azurewebsites.net/health](https://weeklyplanner-api.azurewebsites.net/health) |

### GitHub Secrets Required

| Secret | Purpose |
|---|---|
| `AZURE_CREDENTIALS` | Azure service principal JSON for backend deployment |
| `STATIC_WEB_APPS_TOKEN` | Azure Static Web Apps deployment token |

### Environment Configuration

| Environment | Database | API URL |
|---|---|---|
| Development | SQLite (`weeklyplanner.db`) | `http://localhost:5000/api` |
| Docker | PostgreSQL 16 | `http://localhost:5000/api` |
| Production | Azure PostgreSQL | `https://weeklyplanner-api.azurewebsites.net/api` |

### SPA Routing (Azure Static Web Apps)

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["*.{css,js,svg,png,jpg,ico,txt,map}"]
  }
}
```

---

## Screenshots

> Add screenshots to `docs/screenshots/` for:
>
> | Screen | Description |
> |---|---|
> | Home (Lead) | Dashboard with action cards and week management |
> | Home (Member) | Dashboard with progress tracking cards |
> | Planning Form | Week creation with Tuesday date picker |
> | Category Sliders | Visual percentage allocation (must sum to 100%) |
> | Review & Freeze | Pre-freeze summary with member allocations |
> | Lead Dashboard | Team progress with per-member breakdown |
> | Member Board | Task assignment with hour allocation |
> | Update Progress | Actual hours and completion tracking |
> | Backlog | Item management with category filtering |
> | Dark Mode | Full dark theme across all pages |

---

## Error Handling

### Backend — Global Exception Middleware

| Exception | HTTP Status | Response |
|---|---|---|
| `ValidationException` | `400` | Validation error details (RFC 7807) |
| `KeyNotFoundException` | `404` | Not found message |
| `InvalidOperationException` | `400` | Bad request message |
| Unhandled | `500` | Internal server error |

### Frontend

| Layer | Strategy |
|---|---|
| HTTP Interceptor | Prepends base API URL to all requests |
| Service calls | Error callbacks with toast notifications |
| Navigation | Redirects to `/home` on 404 responses |
| Forms | Reactive validation with inline error messages |

---

## Development Workflow

```
1. Create feature branch from main
2. Develop + write tests
3. Push → CI runs automatically
4. Open PR → Quality Gate enforced
5. Review + merge → Auto-deploys to Azure
```

### Commit Convention

| Prefix | Purpose |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `test:` | Tests |
| `docs:` | Documentation |
| `refactor:` | Code improvement |
| `chore:` | Maintenance |

---

## Engineering Principles

| Principle | Implementation |
|---|---|
| Clean Architecture | Strict layer separation, dependencies point inward |
| Domain-Driven Design | Business logic in domain entities, not services |
| CQRS | Commands and queries separated via MediatR |
| Server-Side Validation | All rules enforced in backend; frontend is UX-only |
| Immutable State | Frozen weeks reject all modifications |
| Structured Logging | Serilog with contextual enrichment |
| Convention over Config | Sensible defaults, minimal boilerplate |

---

## License

All rights reserved.
