# Weekly Planner System

## 🎯 Overview

Production-grade Weekly Planning SPA with strict business rule enforcement.

**Technology Stack:**
- Backend: ASP.NET Core 8 (Clean Architecture, CQRS)
- Frontend: Angular 17 (Standalone Components, Reactive Forms)
- Database: PostgreSQL
- Deployment: Azure (App Service + Static Web App)
- CI/CD: GitHub Actions
- Testing: 100% code coverage enforced

---

## 📋 Key Features

✅ **Backlog Management**
- Create, edit, archive backlog items
- Categories: ClientFocused, TechDebt, RnD

✅ **Planning (Tuesday Only)**
- Strict Tuesday validation
- Work period: Wednesday → Monday (4 working days)
- 30 hours per member enforced
- Category percentage rules (must equal 100%)

✅ **Member Planning**
- Allocate hours from backlog items
- Category limit enforcement
- Real-time validation

✅ **Frozen State**
- Prevents modification after planning finalized
- Only ActualHours & ProgressPercent can be updated

✅ **Team Lead Dashboard**
- Aggregated metrics
- Per-user summary
- Per-item breakdown

---

## 🏗️ Architecture

```
Angular SPA (Standalone)
        ↓
ASP.NET Core 8 API (Clean Architecture)
        ↓
PostgreSQL Database
```

**Backend Layers:**
- Domain: Business entities & rules
- Application: Commands, Queries, Validators
- Infrastructure: DbContext, Repositories
- API: Controllers, Middleware

**Frontend Structure:**
- Shared components
- Pages (Home, Backlog, Planning, Dashboard)
- Services (HTTP, State)
- Models (Typed DTOs)

---

## 📦 Project Structure

```
weekly-planner/
├── .github/workflows/          # CI/CD pipelines
├── backend/                    # ASP.NET Core solution
│   ├── src/
│   │   ├── WeeklyPlanner.Domain/
│   │   ├── WeeklyPlanner.Application/
│   │   ├── WeeklyPlanner.Infrastructure/
│   │   └── WeeklyPlanner.API/
│   └── tests/
├── frontend/                   # Angular application
│   ├── src/app/
│   └── e2e/
├── docs/                       # Documentation
├── scripts/                    # Setup & seed scripts
└── docker-compose.yml          # Local dev environment
```

---

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- PostgreSQL 16
- Git

### Local Development

**1. Backend Setup**
```powershell
cd backend
dotnet restore
dotnet ef database update
dotnet run
# API: http://localhost:5000/swagger
```

**2. Frontend Setup**
```bash
cd frontend
npm install
ng serve
# App: http://localhost:4200
```

**3. Database (Docker)**
```bash
docker-compose up -d db
# Connection: localhost:5432
# User: planner / Password: planner
```

---

## 🧪 Testing

**Run Backend Tests**
```powershell
cd backend
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

**Run Frontend Tests**
```bash
cd frontend
npm run test -- --watch=false --code-coverage
```

**Coverage Requirement:** 100% enforced in CI pipeline

---

## 📚 Business Rules

### Planning Creation
- Allowed only on **Tuesday**
- Work period: **Wednesday → Monday** (4 working days)
- Members: **8 hours/day = 30 hours total**

### Category Allocation
- Team Lead defines: ClientPercent + TechDebtPercent + RndPercent = **100%**
- Per member: hours calculated from percentages
- Members **cannot exceed** category limits

### Freeze State
- After finalization: **IsFrozen = true**
- Cannot add/remove tasks
- Cannot change planned hours
- **Can only update:** ActualHours, ProgressPercent

### Validation
- **All business rules validated server-side**
- Frontend shows validation messages only
- No partial implementations

---

## 🔄 CI/CD Pipeline

**GitHub Actions Workflows:**
1. `backend-ci.yml` - Build, test, coverage check (100% threshold)
2. `frontend-ci.yml` - Lint, test, build
3. `deploy.yml` - Auto-deploy to Azure on `main` branch

**Deployment Targets:**
- Backend: Azure App Service
- Frontend: Azure Static Web App

---

## 📖 Documentation

- [Architecture Decision Records](docs/decisions.md)
- [Business Rules Implementation](docs/business-rules.md)
- [API Contract](docs/api-contract.md)

---

## 🏥 Health Check

```
GET /health
```

Response: `{ "status": "healthy" }`

---

## 📝 Engineering Standards

✅ Clean Architecture  
✅ SOLID Principles  
✅ Conventional Commits  
✅ 100% Test Coverage  
✅ ESLint + StyleCop  
✅ Swagger (Dev only)  
✅ Global Exception Middleware  
✅ Serilog Logging  

---

## 🔐 License

Proprietary

---

## 👥 Contributors

(Team members added during implementation)

---

## 📞 Support

For issues, create a GitHub issue with:
- Detailed description
- Steps to reproduce
- Environment information
