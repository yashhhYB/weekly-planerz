using MediatR;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.Application.Commands;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.Application.Handlers;

/// <summary>
/// Handler for creating a new planning week
/// </summary>
public class CreatePlanningWeekHandler : IRequestHandler<CreatePlanningWeekCommand, Result<PlanningWeekDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<CreatePlanningWeekHandler> _logger;

    public CreatePlanningWeekHandler(ApplicationDbContext dbContext, ILogger<CreatePlanningWeekHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<PlanningWeekDto>> Handle(CreatePlanningWeekCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Creating new planning week for date: {PlanningDate}", request.Request.PlanningDate);

            // Create the domain entity
            var planningWeek = new PlanningWeek(
                request.Request.PlanningDate,
                request.Request.ClientPercent,
                request.Request.TechDebtPercent,
                request.Request.RndPercent
            );

            _dbContext.PlanningWeeks.Add(planningWeek);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully created planning week {Id}", planningWeek.Id);

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

            return Result<PlanningWeekDto>.Ok(dto, "Planning week created successfully");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Validation error creating planning week");
            return Result<PlanningWeekDto>.Fail(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating planning week");
            return Result<PlanningWeekDto>.Fail("Failed to create planning week");
        }
    }
}

/// <summary>
/// Handler for updating a planning week
/// </summary>
public class UpdatePlanningWeekHandler : IRequestHandler<UpdatePlanningWeekCommand, Result<PlanningWeekDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<UpdatePlanningWeekHandler> _logger;

    public UpdatePlanningWeekHandler(ApplicationDbContext dbContext, ILogger<UpdatePlanningWeekHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<PlanningWeekDto>> Handle(UpdatePlanningWeekCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Updating planning week {Id}", request.Id);

            var planningWeek = await _dbContext.PlanningWeeks.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);

            if (planningWeek == null)
            {
                _logger.LogWarning("Planning week {Id} not found", request.Id);
                return Result<PlanningWeekDto>.Fail("Planning week not found");
            }

            // Note: In a real scenario, you might have update methods on the domain entity
            // For now, we're directly modifying properties - consider refactoring this

            planningWeek.Update(
                request.Request.ClientPercent,
                request.Request.TechDebtPercent,
                request.Request.RndPercent
            );

            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully updated planning week {Id}", request.Id);

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

            return Result<PlanningWeekDto>.Ok(dto, "Planning week updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Fail("Failed to update planning week");
        }
    }
}

/// <summary>
/// Handler for freezing a planning week
/// </summary>
public class FreezePlanningWeekHandler : IRequestHandler<FreezePlanningWeekCommand, Result<PlanningWeekDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<FreezePlanningWeekHandler> _logger;

    public FreezePlanningWeekHandler(ApplicationDbContext dbContext, ILogger<FreezePlanningWeekHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<PlanningWeekDto>> Handle(FreezePlanningWeekCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Freezing planning week {Id}", request.Id);

            var planningWeek = await _dbContext.PlanningWeeks.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);

            if (planningWeek == null)
            {
                _logger.LogWarning("Planning week {Id} not found", request.Id);
                return Result<PlanningWeekDto>.Fail("Planning week not found");
            }

            planningWeek.Freeze();
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully froze planning week {Id}", request.Id);

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

            return Result<PlanningWeekDto>.Ok(dto, "Planning week frozen successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error freezing planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Fail("Failed to freeze planning week");
        }
    }
}

/// <summary>
/// Handler for deleting a planning week
/// </summary>
public class DeletePlanningWeekHandler : IRequestHandler<DeletePlanningWeekCommand, Result<bool>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<DeletePlanningWeekHandler> _logger;

    public DeletePlanningWeekHandler(ApplicationDbContext dbContext, ILogger<DeletePlanningWeekHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeletePlanningWeekCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Deleting planning week {Id}", request.Id);

            var planningWeek = await _dbContext.PlanningWeeks.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);

            if (planningWeek == null)
            {
                _logger.LogWarning("Planning week {Id} not found", request.Id);
                return Result<bool>.Fail("Planning week not found");
            }

            _dbContext.PlanningWeeks.Remove(planningWeek);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully deleted planning week {Id}", request.Id);
            return Result<bool>.Ok(true, "Planning week deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting planning week {Id}", request.Id);
            return Result<bool>.Fail("Failed to delete planning week");
        }
    }
}

/// <summary>
/// Handler for starting a planning week (Setup -> InProgress)
/// </summary>
public class StartPlanningWeekHandler : IRequestHandler<StartPlanningWeekCommand, Result<PlanningWeekDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<StartPlanningWeekHandler> _logger;

    public StartPlanningWeekHandler(ApplicationDbContext dbContext, ILogger<StartPlanningWeekHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<PlanningWeekDto>> Handle(StartPlanningWeekCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var planningWeek = await _dbContext.PlanningWeeks.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);
            if (planningWeek == null)
                return Result<PlanningWeekDto>.Fail("Planning week not found");

            planningWeek.Start();
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Started planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Ok(PlanningWeekMapper.MapToDto(planningWeek), "Planning week started");
        }
        catch (InvalidOperationException ex)
        {
            return Result<PlanningWeekDto>.Fail(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Fail("Failed to start planning week");
        }
    }
}

/// <summary>
/// Handler for completing a planning week (InProgress -> Completed)
/// </summary>
public class CompletePlanningWeekHandler : IRequestHandler<CompletePlanningWeekCommand, Result<PlanningWeekDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<CompletePlanningWeekHandler> _logger;

    public CompletePlanningWeekHandler(ApplicationDbContext dbContext, ILogger<CompletePlanningWeekHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<PlanningWeekDto>> Handle(CompletePlanningWeekCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var planningWeek = await _dbContext.PlanningWeeks.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);
            if (planningWeek == null)
                return Result<PlanningWeekDto>.Fail("Planning week not found");

            planningWeek.Complete();
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Completed planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Ok(PlanningWeekMapper.MapToDto(planningWeek), "Planning week completed");
        }
        catch (InvalidOperationException ex)
        {
            return Result<PlanningWeekDto>.Fail(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Fail("Failed to complete planning week");
        }
    }
}

/// <summary>
/// Handler for archiving a planning week (Completed -> Archived)
/// </summary>
public class ArchivePlanningWeekHandler : IRequestHandler<ArchivePlanningWeekCommand, Result<PlanningWeekDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<ArchivePlanningWeekHandler> _logger;

    public ArchivePlanningWeekHandler(ApplicationDbContext dbContext, ILogger<ArchivePlanningWeekHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<PlanningWeekDto>> Handle(ArchivePlanningWeekCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var planningWeek = await _dbContext.PlanningWeeks.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);
            if (planningWeek == null)
                return Result<PlanningWeekDto>.Fail("Planning week not found");

            planningWeek.ArchiveWeek();
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Archived planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Ok(PlanningWeekMapper.MapToDto(planningWeek), "Planning week archived");
        }
        catch (InvalidOperationException ex)
        {
            return Result<PlanningWeekDto>.Fail(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving planning week {Id}", request.Id);
            return Result<PlanningWeekDto>.Fail("Failed to archive planning week");
        }
    }
}

/// <summary>
/// Helper to map PlanningWeek entity to DTO
/// </summary>
internal static class PlanningWeekMapper
{
    public static PlanningWeekDto MapToDto(PlanningWeek pw) => new()
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
    };
}
