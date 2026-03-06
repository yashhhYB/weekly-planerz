# Integration Tests

Cross-layer integration tests that verify API endpoints with a real (in-memory) database.

## Running

```bash
cd backend
dotnet test WeeklyPlanner.IntegrationTests/
```

## Scope

- Controller → MediatR → Handler → EF Core round-trips
- Request validation pipeline
- Error response formatting
