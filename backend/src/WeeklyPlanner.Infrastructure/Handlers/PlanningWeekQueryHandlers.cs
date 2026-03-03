using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.Application.Handlers;

/// <summary>
/// Handler for retrieving all planning weeks
/// </summary>
public class GetAllPlanningWeeksHandler : IRequestHandler<GetAllPlanningWeeksQuery, Result<List<PlanningWeekDto>>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<GetAllPlanningWeeksHandler> _logger;

    public GetAllPlanningWeeksHandler(ApplicationDbContext dbContext, ILogger<GetAllPlanningWeeksHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<List<PlanningWeekDto>>> Handle(GetAllPlanningWeeksQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching all planning weeks");

            var planningWeeks = await _dbContext.PlanningWeeks
                .AsNoTracking()
                .Select(pw => new PlanningWeekDto
                {
                    Id = pw.Id,
                    PlanningDate = pw.PlanningDate,
                    StartDate = pw.StartDate,
                    EndDate = pw.EndDate,
                    Status = pw.Status,
                    IsFrozen = pw.IsFrozen,
                    ClientPercent = pw.ClientPercent,
                    TechDebtPercent = pw.TechDebtPercent,
                    RndPercent = pw.RndPercent,
                    CreatedAt = pw.CreatedAt
                })
                .OrderByDescending(pw => pw.PlanningDate)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Successfully fetched {Count} planning weeks", planningWeeks.Count);
            return Result<List<PlanningWeekDto>>.Ok(planningWeeks, $"Retrieved {planningWeeks.Count} planning weeks");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching planning weeks");
            return Result<List<PlanningWeekDto>>.Fail("Failed to retrieve planning weeks");
        }
    }
}

/// <summary>
/// Handler for retrieving a specific planning week by ID
/// </summary>
public class GetPlanningWeekByIdHandler : IRequestHandler<GetPlanningWeekByIdQuery, Result<PlanningWeekDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<GetPlanningWeekByIdHandler> _logger;

    public GetPlanningWeekByIdHandler(ApplicationDbContext dbContext, ILogger<GetPlanningWeekByIdHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<PlanningWeekDto>> Handle(GetPlanningWeekByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching planning week with ID: {Id}", request.Id);

            var planningWeek = await _dbContext.PlanningWeeks
                .AsNoTracking()
                .FirstOrDefaultAsync(pw => pw.Id == request.Id, cancellationToken);

            if (planningWeek == null)
            {
                _logger.LogWarning("Planning week with ID {Id} not found", request.Id);
                return Result<PlanningWeekDto>.Fail("Planning week not found");
            }

            var dto = new PlanningWeekDto
            {
                Id = planningWeek.Id,
                PlanningDate = planningWeek.PlanningDate,
                StartDate = planningWeek.StartDate,
                EndDate = planningWeek.EndDate,
                Status = planningWeek.Status,
                IsFrozen = planningWeek.IsFrozen,
                ClientPercent = planningWeek.ClientPercent,
                TechDebtPercent = planningWeek.TechDebtPercent,
                RndPercent = planningWeek.RndPercent,
                CreatedAt = planningWeek.CreatedAt
            };

            _logger.LogInformation("Successfully retrieved planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Fail("Failed to retrieve planning week");
        }
    }
}
