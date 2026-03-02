# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Angular 17 SPA                       │
│              (Standalone Components)                    │
│         Dark Mode + Responsive Design                   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/HTTPS
                           ↓
┌─────────────────────────────────────────────────────────┐
│            ASP.NET Core 8 API (Clean Arch)              │
│                  Built on Azure App                     │
├─────────────────────────────────────────────────────────┤
│  API Layer          Middleware Layer                    │
│  ├─ Controllers      ├─ Exception Handling              │
│  ├─ Routing         ├─ Logging (Serilog)               │
│  └─ Swagger         ├─ Authentication                  │
└──────────┬───────────────────────────────────┬──────────┘
           │                                   │
           ↓                                   ↓
┌────────────────────────┐      ┌──────────────────────┐
│  Application Layer     │      │  Infrastructure      │
│  ├─ Commands          │      │  ├─ DbContext        │
│  ├─ Queries           │      │  ├─ Repositories     │
│  ├─ Validators        │      │  └─ EF Core 8        │
│  └─ MediatR Handler   │      └──────────────────────┘
└──────────┬─────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│            Domain Layer (Business Logic)                │
│         NO framework dependencies here                  │
│         ├─ Entities                                     │
│         ├─ Enums                                        │
│         ├─ Domain Services                              │
│         └─ Business Rules (All validation)              │
└──────────┬──────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│        PostgreSQL Database (Azure)                      │
│         ├─ BacklogItems Table                           │
│         ├─ PlanningWeeks Table                          │
│         ├─ PlanEntries Table                            │
│         ├─ PlanEntryItems Table                         │
│         └─ Users Table                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Clean Architecture Layers

### 1. **Domain Layer** (Core Business Logic)
- **No external dependencies**
- Contains business entities and rules
- All validation logic lives here
- Framework-agnostic

**Folders:**
```
Domain/
├── Entities/
│   ├── BacklogItem
│   ├── PlanningWeek
│   ├── PlanEntry
│   └── User
├── Enums/
│   ├── BacklogItemCategory
│   ├── PlanningStatus
│   └── UserRole
└── Services/
    ├── PlanningValidationService
    ├── CategoryAllocationService
    └── PlanEntryCalculationService
```

### 2. **Application Layer** (Use Cases)
- CQRS pattern with MediatR
- Commands (write operations)
- Queries (read operations)
- Validators (FluentValidation)
- DTOs (Data Transfer Objects)

**Folders:**
```
Application/
├── Commands/
│   ├── CreateBacklogItem/
│   ├── CreatePlanningWeek/
│   ├── CreatePlanEntry/
│   └── FreezePlanning/
├── Queries/
│   ├── GetBacklogItems/
│   ├── GetPlanningWeek/
│   ├── GetDashboard/
│   └── GetPastWeeks/
├── Validators/
│   ├── CreateBacklogItemValidator
│   ├── CreatePlanningWeekValidator
│   └── CreatePlanEntryValidator
└── Interfaces/
    ├── IRepository<T>
    └── IUnitOfWork
```

### 3. **Infrastructure Layer** (Data Access)
- Entity Framework Core
- Database migrations
- Repository implementations
- External service integrations

**Folders:**
```
Infrastructure/
├── Persistence/
│   ├── ApplicationDbContext.cs
│   └── Migrations/
└── Repositories/
    ├── BacklogItemRepository
    ├── PlanningWeekRepository
    └── GenericRepository<T>
```

### 4. **API Layer** (HTTP Interface)
- ASP.NET Core controllers
- Swagger documentation
- Global exception middleware
- Health check endpoint

**Folders:**
```
API/
├── Controllers/
│   ├── BacklogController
│   ├── PlanningController
│   ├── DashboardController
│   └── HealthController
├── Middleware/
│   ├── ExceptionHandlingMiddleware
│   └── LoggingMiddleware
├── Program.cs
└── appsettings.json
```

---

## Data Flow Examples

### Example 1: Create Planning Week

```
1. UI: User clicks "Create Planning" on Tuesday

2. Frontend (Angular):
   - Validates form inputs
   - Sends POST /api/planning/create with date

3. API Layer:
   - Route to PlanningController.Create()
   - Deserialize to CreatePlanningWeekCommand

4. Application Layer:
   - MediatR dispatcher receives command
   - CreatePlanningWeekValidator validates
   - CreatePlanningWeekHandler executes command

5. Domain Layer:
   - new PlanningWeek() constructor
   - Validates: DayOfWeek == Tuesday
   - Throws if not Tuesday

6. Infrastructure Layer:
   - DbContext.PlanningWeeks.Add()
   - SaveChanges()

7. Response:
   - Return 201 Created with PlanningWeekId
   - Frontend navigates to planning setup
```

### Example 2: Update Planned Hours

```
1. UI: Member allocates hours to backlog item

2. Frontend (Angular):
   - Validates total = 30 hours (client-side warning)
   - Sends POST /api/planning/{id}/plan-entry

3. API Layer:
   - Route to PlanningController.UpdatePlanEntry()
   - Deserialize to UpdatePlanEntryCommand

4. Application Layer:
   - Validator checks:
     - Week exists
     - Week not frozen
     - Total hours = 30
     - Category limits respected

5. Domain Layer:
   - PlanEntry.ValidateCategoryLimits()
   - PlanEntry.ValidateTotalHours()
   - All business rules evaluated

6. Infrastructure Layer:
   - DbContext.PlanEntries.Update()
   - SaveChanges()

7. Response:
   - Return 200 OK with updated entry
   - Frontend displays confirmation
```

---

## Testing Strategy

### Unit Tests (Domain Layer)
```
WeeklyPlanner.UnitTests/
├── Domain/
│   ├── PlanningWeekTests.cs
│   ├── PlanEntryTests.cs
│   ├── BacklogItemTests.cs
│   └── CategoryAllocationTests.cs
├── Application/
│   ├── CreatePlanningWeekHandlerTests.cs
│   └── CreatePlanEntryHandlerTests.cs
└── Services/
    ├── PlanningValidationServiceTests.cs
    └── CategoryAllocationServiceTests.cs
```

**Goal:** 100% coverage of domain logic

### Integration Tests (API Layer)
```
WeeklyPlanner.IntegrationTests/
├── Controllers/
│   ├── PlanningControllerTests.cs
│   ├── BacklogControllerTests.cs
│   └── DashboardControllerTests.cs
└── Workflows/
    ├── PlanningWeekWorkflowTests.cs
    └── MemberPlanningWorkflowTests.cs
```

**Goal:** Test complete workflows end-to-end

---

## Deployment Architecture

```
GitHub Repository (main branch)
    ↓
GitHub Actions CI/CD Pipeline
    ├─ Backend CI
    │  ├─ Build (.NET 8)
    │  ├─ Test (100% coverage required)
    │  └─ Publish
    │
    └─ Frontend CI
       ├─ Lint (ESLint)
       ├─ Test (Karma)
       └─ Build (Production)
    ↓
    Deployment Phase (if all tests pass)
    ├─ Backend
    │  └─ Deploy to Azure App Service
    │
    └─ Frontend
       └─ Deploy to Azure Static Web App
    ↓
Live Application
├─ Frontend: https://your-spa-url.com
└─ Backend: https://your-api-url.com/swagger
```

---

## Security Considerations

1. **HTTPS Only** - All communication encrypted
2. **Authentication** - Bearer token (JWT recommended)
3. **Authorization** - Role-based (Lead vs Member)
4. **Input Validation** - Strict server-side
5. **SQL Injection Prevention** - Entity Framework (parameterized queries)
6. **CORS** - Configured for frontend domain only
7. **Rate Limiting** - On API endpoints
8. **Data Sensitivity** - No PII logging

---

## Performance Considerations

1. **Database Indexing** - On frequently queried columns
2. **Query Optimization** - Eager loading where needed
3. **Caching** - Dashboard data cached (refresh on update)
4. **Pagination** - List endpoints return pages
5. **Connection Pooling** - Configured in connection string
6. **Async/Await** - All I/O operations async

---

## Monitoring & Logging

1. **Serilog** - Structured logging
2. **Application Insights** (Optional) - Azure integration
3. **Health Endpoint** - GET /health
4. **Log Levels**
   - Error: Domain validation failures
   - Warning: Business rule near-violations
   - Info: User actions, workflows
   - Debug: All database operations

