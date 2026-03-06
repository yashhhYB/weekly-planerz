# System Design

## Overview

Weekly Planner is a full-stack web application for managing team sprint planning.
It enforces strict business rules (30-hour allocations, category budgets,
Tuesday-only creation, freeze immutability) on the server side while providing
a responsive Angular SPA for end users.

## High-Level Architecture

```
┌──────────────────────────────────┐
│  Angular 17 SPA (Standalone)     │
│  ├─ NgRx Store (state)           │
│  ├─ Feature modules              │
│  └─ Theme service (light/dark)   │
└──────────────┬───────────────────┘
               │  HTTP / REST
┌──────────────▼───────────────────┐
│  ASP.NET Core 8 Web API          │
│  ├─ Controllers (thin)           │
│  ├─ MediatR (CQRS)              │
│  ├─ FluentValidation            │
│  └─ EF Core 8                    │
└──────────────┬───────────────────┘
               │
┌──────────────▼───────────────────┐
│  Database                        │
│  ├─ SQLite (Development)         │
│  └─ PostgreSQL (Production)      │
└──────────────────────────────────┘
```

## Backend Layers

| Layer            | Responsibility                                  |
| ---------------- | ----------------------------------------------- |
| **Domain**       | Entities, enums, value objects. Zero dependencies. |
| **Application**  | Commands, Queries, Validators via MediatR.       |
| **Infrastructure** | DbContext, Repositories, Migrations.           |
| **API**          | Controllers, middleware, DI composition root.    |

## Frontend Architecture

| Concern          | Implementation                                   |
| ---------------- | ------------------------------------------------ |
| **State**        | NgRx Store with separate feature slices (team, planning, backlog). |
| **Routing**      | Lazy-loaded feature modules (home, planning, backlog). |
| **Services**     | HTTP services per domain + UserContext, Theme, Toast. |
| **Components**   | Standalone Angular 17 components with inline templates. |

## Deployment Targets

- **Backend**: Azure App Service (Linux, .NET 8)
- **Frontend**: Azure Static Web Apps (Free tier)
- **Database**: Azure Database for PostgreSQL (Burstable B1ms)
- **CI/CD**: GitHub Actions (build → test → deploy)
