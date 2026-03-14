# Architecture

Weekly Planerz uses a split frontend/backend architecture:

- Frontend: Angular SPA hosted on Vercel
- Backend: ASP.NET Core API hosted on Railway
- Data: SQLite (production volume on Railway) with PostgreSQL-ready infrastructure abstractions

## System Diagram (Mermaid)

```mermaid
flowchart LR
	U[Team Member or Lead] --> F[Angular SPA on Vercel]
	F --> A[ASP.NET Core API on Railway]
	A --> D[(SQLite Data File on Railway Volume)]
	D --> A
	A --> F
```

## Backend Layers

- Domain: business rules and invariants
- Application: CQRS handlers, validation, orchestration
- Infrastructure: EF Core persistence and repository implementations
- API: controllers, middleware, HTTP contracts, health endpoint

## Reliability Principles

- Startup migration retry to avoid crash loops
- Global exception handling in API and frontend
- Consistent API response shape for client resilience
- Health endpoint for operational monitoring

## Application Flow (Mermaid)

```mermaid
flowchart TD
	A[Home] --> B[Team Setup]
	B --> C[Backlog]
	C --> D[Create Planning Week]
	D --> E[Planning Detail]
	E --> F[Member Board]
	E --> G[Lead Dashboard]
	E --> H[Review and Freeze]
	F --> I[Progress Update]
	I --> G
	G --> J[Past Weeks]
```
