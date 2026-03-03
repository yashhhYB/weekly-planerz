using MediatR;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.Application.Commands;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.Application.Handlers;

/// <summary>
/// Handler for creating a new backlog item
/// </summary>
public class CreateBacklogItemHandler : IRequestHandler<CreateBacklogItemCommand, Result<BacklogItemDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<CreateBacklogItemHandler> _logger;

    public CreateBacklogItemHandler(ApplicationDbContext dbContext, ILogger<CreateBacklogItemHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<BacklogItemDto>> Handle(CreateBacklogItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Creating new backlog item: {Title}", request.Request.Title);

            var backlogItem = new BacklogItem(
                request.Request.Title,
                request.Request.Description,
                request.Request.Category,
                request.Request.EstimatedHours
            );

            _dbContext.BacklogItems.Add(backlogItem);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully created backlog item {Id}", backlogItem.Id);

            var dto = new BacklogItemDto
            {
                Id = backlogItem.Id,
                Title = backlogItem.Title,
                Description = backlogItem.Description,
                Category = backlogItem.Category,
                EstimatedHours = backlogItem.EstimatedHours,
                IsArchived = backlogItem.IsArchived,
                CreatedAt = backlogItem.CreatedAt
            };

            return Result<BacklogItemDto>.Ok(dto, "Backlog item created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating backlog item");
            return Result<BacklogItemDto>.Fail("Failed to create backlog item");
        }
    }
}

/// <summary>
/// Handler for updating a backlog item
/// </summary>
public class UpdateBacklogItemHandler : IRequestHandler<UpdateBacklogItemCommand, Result<BacklogItemDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<UpdateBacklogItemHandler> _logger;

    public UpdateBacklogItemHandler(ApplicationDbContext dbContext, ILogger<UpdateBacklogItemHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<BacklogItemDto>> Handle(UpdateBacklogItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Updating backlog item {Id}", request.Id);

            var backlogItem = await _dbContext.BacklogItems.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);

            if (backlogItem == null)
            {
                _logger.LogWarning("Backlog item {Id} not found", request.Id);
                return Result<BacklogItemDto>.Fail("Backlog item not found");
            }

            backlogItem.Update(request.Request.Title, request.Request.Description, request.Request.EstimatedHours);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully updated backlog item {Id}", request.Id);

            var dto = new BacklogItemDto
            {
                Id = backlogItem.Id,
                Title = backlogItem.Title,
                Description = backlogItem.Description,
                Category = backlogItem.Category,
                EstimatedHours = backlogItem.EstimatedHours,
                IsArchived = backlogItem.IsArchived,
                CreatedAt = backlogItem.CreatedAt
            };

            return Result<BacklogItemDto>.Ok(dto, "Backlog item updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating backlog item {Id}", request.Id);
            return Result<BacklogItemDto>.Fail("Failed to update backlog item");
        }
    }
}

/// <summary>
/// Handler for archiving a backlog item
/// </summary>
public class ArchiveBacklogItemHandler : IRequestHandler<ArchiveBacklogItemCommand, Result<BacklogItemDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<ArchiveBacklogItemHandler> _logger;

    public ArchiveBacklogItemHandler(ApplicationDbContext dbContext, ILogger<ArchiveBacklogItemHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<BacklogItemDto>> Handle(ArchiveBacklogItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Archiving backlog item {Id}", request.Id);

            var backlogItem = await _dbContext.BacklogItems.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);

            if (backlogItem == null)
            {
                _logger.LogWarning("Backlog item {Id} not found", request.Id);
                return Result<BacklogItemDto>.Fail("Backlog item not found");
            }

            backlogItem.Archive();
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully archived backlog item {Id}", request.Id);

            var dto = new BacklogItemDto
            {
                Id = backlogItem.Id,
                Title = backlogItem.Title,
                Description = backlogItem.Description,
                Category = backlogItem.Category,
                EstimatedHours = backlogItem.EstimatedHours,
                IsArchived = backlogItem.IsArchived,
                CreatedAt = backlogItem.CreatedAt
            };

            return Result<BacklogItemDto>.Ok(dto, "Backlog item archived successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving backlog item {Id}", request.Id);
            return Result<BacklogItemDto>.Fail("Failed to archive backlog item");
        }
    }
}

/// <summary>
/// Handler for deleting a backlog item
/// </summary>
public class DeleteBacklogItemHandler : IRequestHandler<DeleteBacklogItemCommand, Result<bool>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<DeleteBacklogItemHandler> _logger;

    public DeleteBacklogItemHandler(ApplicationDbContext dbContext, ILogger<DeleteBacklogItemHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteBacklogItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Deleting backlog item {Id}", request.Id);

            var backlogItem = await _dbContext.BacklogItems.FindAsync(new object[] { request.Id }, cancellationToken: cancellationToken);

            if (backlogItem == null)
            {
                _logger.LogWarning("Backlog item {Id} not found", request.Id);
                return Result<bool>.Fail("Backlog item not found");
            }

            _dbContext.BacklogItems.Remove(backlogItem);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully deleted backlog item {Id}", request.Id);
            return Result<bool>.Ok(true, "Backlog item deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting backlog item {Id}", request.Id);
            return Result<bool>.Fail("Failed to delete backlog item");
        }
    }
}
