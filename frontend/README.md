# Weekly Planner - Frontend Application

Angular 17 Frontend for the Weekly Planner time management system.

## Architecture Overview

### Technology Stack
- **Framework**: Angular 17.0.0
- **Language**: TypeScript 5.2.2
- **Styling**: CSS with inline component styling
- **Testing**: Jasmine/Karma (unit tests), Cypress (E2E tests)
- **Build**: Angular CLI

### Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── planning.service.ts      # Planning week CRUD
│   │   │   │   ├── backlog.service.ts       # Backlog item CRUD
│   │   │   │   └── index.ts                 # Barrel export
│   │   │   └── interceptors/
│   │   │       ├── api.interceptor.ts       # HTTP interceptor
│   │   │       └── index.ts
│   │   ├── features/
│   │   │   ├── planning/
│   │   │   │   ├── planning.routes.ts
│   │   │   │   └── pages/
│   │   │   │       ├── planning-list/
│   │   │   │       ├── planning-form/
│   │   │   │       └── planning-detail/
│   │   │   └── backlog/
│   │   │       ├── backlog.routes.ts
│   │   │       └── pages/
│   │   │           ├── backlog-list/
│   │   │           ├── backlog-form/
│   │   │           └── backlog-detail/
│   │   ├── models/
│   │   │   ├── planning-week.model.ts
│   │   │   ├── backlog-item.model.ts
│   │   │   └── index.ts
│   │   ├── home/
│   │   │   └── home.component.ts            # Dashboard
│   │   ├── app.component.ts                 # Root component with nav
│   │   └── app.routes.ts                    # Route configuration
│   ├── environments/
│   │   ├── environment.ts                   # Dev config
│   │   └── environment.prod.ts              # Prod config
│   ├── main.ts
│   ├── index.html
│   └── styles.css
├── package.json
├── tsconfig.json
├── angular.json
└── karma.conf.js
```

## Services

### PlanningService
Manages all planning week operations.

```typescript
// Get all planning weeks
getAllPlanningWeeks(): Observable<PlanningWeek[]>

// Get specific planning week
getPlanningWeekById(id: string): Observable<PlanningWeek>

// Create new planning week
createPlanningWeek(request: CreatePlanningWeekRequest): Observable<PlanningWeek>

// Update planning week
updatePlanningWeek(id: string, request: UpdatePlanningWeekRequest): Observable<PlanningWeek>

// Freeze planning week (prevent modifications)
freezePlanningWeek(id: string): Observable<PlanningWeek>

// Delete planning week
deletePlanningWeek(id: string): Observable<void>
```

### BacklogService
Manages all backlog item operations.

```typescript
// Get all backlog items
getAllBacklogItems(): Observable<BacklogItem[]>

// Get active (non-archived) backlog items
getActiveBacklogItems(): Observable<BacklogItem[]>

// Get specific backlog item
getBacklogItemById(id: string): Observable<BacklogItem>

// Create new backlog item
createBacklogItem(request: CreateBacklogItemRequest): Observable<BacklogItem>

// Update backlog item
updateBacklogItem(id: string, request: UpdateBacklogItemRequest): Observable<BacklogItem>

// Archive backlog item
archiveBacklogItem(id: string): Observable<BacklogItem>

// Delete backlog item
deleteBacklogItem(id: string): Observable<void>
```

### ApiInterceptor
Standardizes HTTP requests and handles errors globally.

Features:
- Adds standard headers (Content-Type, Accept)
- Catches HTTP errors
- Logs errors to console
- Returns user-friendly error messages

## Data Models

### PlanningWeek
```typescript
interface PlanningWeek {
  id: string;
  weekStartDate: Date;
  weekEndDate: Date;
  goals: string;
  keyActivities: string;
  reflection: string;
  healthScore: number;      // 1-10
  productivity: number;      // percentage
  createdAt: Date;
  updatedAt: Date;
}
```

### BacklogItem
```typescript
interface BacklogItem {
  id: string;
  title: string;
  description: string;
  category: BacklogCategory;
  estimatedHours: number;
  status: BacklogStatus;
  isArchived: boolean;
  priority: number;         // 1-5
  planningWeekId?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum BacklogCategory {
  Work = 'Work',
  Personal = 'Personal',
  Learning = 'Learning',
  Health = 'Health',
  Finance = 'Finance',
  Relationships = 'Relationships'
}

enum BacklogStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Archived = 'Archived'
}
```

## Routing

### Main Routes
- `/` → Dashboard
- `/planning` → Planning Weeks (lazy loaded)
- `/backlog` → Backlog Items (lazy loaded)

### Planning Routes
- `/planning` → List all planning weeks
- `/planning/create` → Create new planning week
- `/planning/:id` → View planning week details
- `/planning/:id/edit` → Edit planning week

### Backlog Routes
- `/backlog` → List all backlog items
- `/backlog/create` → Create new backlog item
- `/backlog/:id` → View backlog item details
- `/backlog/:id/edit` → Edit backlog item

## Components

### PlanningListComponent
Displays all planning weeks in a grid layout with:
- Week start date
- Health score and productivity metrics
- Navigation to view/edit/delete

### PlanningFormComponent
Create or edit planning weeks with fields for:
- Week start date (Tuesday validation enforced by API)
- Goals
- Key activities
- Health score (1-10)
- Productivity (%)

### PlanningDetailComponent
View complete planning week with:
- Goals and key activities
- Reflection
- Health score and productivity metrics
- Freeze, Edit, Delete options

### BacklogListComponent
Display backlog items in table format with:
- Status filtering (Pending, InProgress, Completed, Archived)
- Color-coded category and status badges
- Priority visualization
- Archive and edit options

### BacklogFormComponent
Create or edit backlog items with:
- Title and description
- Category selection
- Priority (1-5)
- Estimated hours
- Status (visible when editing)

### BacklogDetailComponent
View complete backlog item with:
- Category, priority, and status display
- Estimated hours
- Visual priority stars
- Archive, Edit, Delete options

### HomeComponent (Dashboard)
Welcome dashboard with:
- Statistics cards (planning weeks, backlog items, active items)
- Feature showcase cards
- Quick action buttons

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm 9+
- Backend API running at `http://localhost:5000`

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`. Application will reload automatically on file changes.

### Build for Production
```bash
npm run build
```
Output will be in `dist/` directory ready for deployment.

### Run Tests
```bash
npm test                    # Unit tests
npm run e2e                # E2E tests
```

### Code Quality
```bash
npm run lint              # Lint code
npm run lint:fix          # Fix linting issues
```

## Environment Configuration

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.weeklyplanner.app/api'
};
```

## API Integration

The frontend communicates with the backend API at `/api/` endpoint with the following structure:

### Planning Endpoint (`/api/planning`)
- `GET /` - Get all planning weeks
- `GET /:id` - Get planning week by ID
- `POST /` - Create new planning week
- `PUT /:id` - Update planning week
- `POST /:id/freeze` - Freeze planning week
- `DELETE /:id` - Delete planning week

### Backlog Endpoint (`/api/backlog`)
- `GET /` - Get all backlog items
- `GET /active` - Get active (non-archived) items
- `GET /:id` - Get backlog item by ID
- `POST /` - Create new backlog item
- `PUT /:id` - Update backlog item
- `POST /:id/archive` - Archive backlog item
- `DELETE /:id` - Delete backlog item

## Design Principles

### Component Design
- **Standalone Components**: Each component is self-contained with its dependencies
- **Reactive Forms**: Validation and form management using Angular Reactive Forms
- **Observable-based**: All async operations use RxJS Observables
- **Memory Safety**: Proper subscription cleanup with `takeUntil()`

### Service Layer
- **Single Responsibility**: Each service handles one domain (Planning or Backlog)
- **DTO Mapping**: Backend DTOs are mapped to domain models
- **State Management**: BehaviorSubjects for reactive state
- **Error Handling**: Standardized error handling through interceptor

### Styling
- **Component Encapsulation**: CSS is scoped to components
- **Responsive Design**: Grid and flexbox layouts adapt to screen size
- **Professional UI**: Gradient accents, smooth transitions, proper spacing
- **Accessibility**: Semantic HTML, proper contrast ratios

## Features Implemented

### Planning Weeks
✅ Create weekly planning cycles  
✅ Set goals and key activities  
✅ Track health score (1-10)  
✅ Track productivity percentage  
✅ Add reflections  
✅ Freeze completed weeks  
✅ View planning history  
✅ Edit planning details  
✅ Delete planning weeks  

### Backlog Management
✅ Create task items  
✅ Categorize tasks (6 categories)  
✅ Set priorities (1-5 scale)  
✅ Estimate hours  
✅ Track status (4 states)  
✅ Archive completed items  
✅ Filter by status  
✅ View task history  
✅ Edit task details  
✅ Delete tasks  

### Dashboard
✅ Statistics overview  
✅ Feature showcase  
✅ Quick action buttons  
✅ Responsive layout  
✅ Professional navigation  

## Performance Optimizations

- Lazy loading for feature modules
- OnPush change detection strategy (can be added)
- Unsubscribe pattern with takeUntil
- Compiled production builds
- Treeshaking enabled

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

1. **State Management (Phase 6)**: Add NgRx for global state management
2. **Testing**: Unit tests for services and components
3. **CI/CD**: Update frontend-ci.yml for automated builds
4. **Docker**: Containerize frontend application
5. **Deployment**: Deploy to Azure App Service

## Troubleshooting

### API Connection Issues
- Ensure backend is running at `http://localhost:5000`
- Check `environment.ts` has correct API URL
- Check browser console for CORS errors

### Build Issues
- Clear `node_modules` and run `npm install`
- Clear Angular cache: `ng cache clean`
- Check Node.js version: `node --version` (must be 18+)

### Component Not Loading
- Check route configuration in `app.routes.ts`
- Verify component is registered in component decorator
- Check browser console for TypeScript errors

## Contributing

Follow these conventions:
- Use Angular style guide recommendations
- Add TypeScript strict mode
- Write components as standalone
- Use Reactive Forms for all forms
- Implement proper error handling
- Add comments for complex logic

## License

MIT - See LICENSE file for details
