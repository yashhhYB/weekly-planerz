# Architecture Decision Records (ADR)

## ADR-001: Use Clean Architecture

**Status:** Approved  
**Date:** 2026-03-02

### Context
We need a maintainable, testable, and scalable backend architecture.

### Decision
Adopt Clean Architecture with distinct layers:
- Domain (business entities & rules)
- Application (use cases, commands, queries)
- Infrastructure (data access, external services)
- API (HTTP exposure)

### Rationale
- Clear separation of concerns
- Easy to test business logic
- Framework-agnostic domain model
- Scalable for future features

### Consequences
- More layers initially (slight complexity)
- Better testability (reduced debugging time)
- Easier to add new features
- Database choice can change without affecting business logic

---

## ADR-002: Use CQRS with MediatR

**Status:** Approved  
**Date:** 2026-03-02

### Context
We need to separate read and write operations to optimize each separately.

### Decision
Use Command Query Responsibility Segregation (CQRS) pattern with MediatR for dispatching.

### Models
- **Commands:** Write operations (CreateBacklogItem, CreatePlanningWeek)
- **Queries:** Read operations (GetBacklogItems, GetPlanningWeek)

### Rationale
- Separate optimization paths for reads vs writes
- Clear intent in code (Command vs Query)
- Easy to add caching for queries later
- Flexible for future event sourcing

### Consequences
- More boilerplate (Handlers, DTOs)
- Clearer read/write intent
- Easier to debug workflows

---

## ADR-003: Server-Side Business Rule Validation

**Status:** Approved  
**Date:** 2026-03-02

### Context
Business rules must be enforced consistently and cannot be bypassed via UI.

### Decision
All business rule validation happens in the backend domain layer:
- Tuesday planning validation
- 30-hour enforcement
- Category percentage validation
- Freeze state immutability

Frontend only shows validation messages.

### Rationale
- No silent failures
- Rules enforced regardless of client
- Prevents data corruption
- Audit trail of all business events

### Consequences
- Backend must validate ALL inputs
- Frontend needs comprehensive error display
- More backend test coverage requirements

---

## ADR-004: 100% Code Coverage Requirement

**Status:** Approved  
**Date:** 2026-03-02

### Context
Domain business logic is mission-critical and must be defect-free.

### Decision
- Backend: 100% code coverage enforced in CI pipeline
- Merge blocked if coverage < 100%
- All domain logic unit tested

### Rationale
- Critical business rules require confidence
- Early bug detection
- Acts as executable documentation
- Reduces production issues

### Consequences
- Higher development time initially
- Better code quality long-term
- Easier refactoring with high coverage

---

## ADR-005: Angular Standalone Components

**Status:** Approved  
**Date:** 2026-03-02

### Context
Angular 17 introduces standalone components that remove need for NgModules.

### Decision
- All new components are standalone
- No shared modules
- Signals for state management
- Reactive Forms for all inputs

### Rationale
- Simpler component structure
- Smaller bundle size
- Easier to test
- Modern Angular approach

### Consequences
- No NgModule imports
- More explicit dependency injection
- Clearer component boundaries

---

## ADR-006: Azure Deployment Architecture

**Status:** Approved  
**Date:** 2026-03-02

### Context
We need reliable, scalable cloud deployment with managed services.

### Decision
- Backend: Azure App Service (.NET 8)
- Frontend: Azure Static Web App
- Database: Azure Database for PostgreSQL
- CI/CD: GitHub Actions

### Rationale
- Managed services (no ops overhead)
- Auto-scaling built-in
- GitHub Actions free tier sufficient
- Pay-as-you-go cost model

### Consequences
- Vendor lock-in to Azure
- Requires Azure subscription
- Simpler ops story
