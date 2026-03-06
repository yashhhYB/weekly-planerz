# E2E Tests

End-to-end tests that exercise the full application stack (frontend + backend).

## Planned Tools

- **Playwright** or **Cypress** for browser automation
- Tests run against a locally hosted backend + Angular dev server

## Running (future)

```bash
# Start backend
cd backend && dotnet run --project WeeklyPlanner.API/

# Start frontend
cd frontend && ng serve

# Run e2e
npx playwright test
```

## Test Scenarios

- [ ] Login / user switching
- [ ] Create planning week (Tuesday validation)
- [ ] Assign tasks to members
- [ ] Freeze planning week
- [ ] Dark/light theme toggle
