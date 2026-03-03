using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.Application.Handlers;

/// <summary>
/// Handler for retrieving all backlog items
/// </summary>
public class GetAllBacklogItemsHandler : IRequestHandler<GetAllBacklogItemsQuery, Result<List<BacklogItemDto>>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<GetAllBacklogItemsHandler> _logger;

    public GetAllBacklogItemsHandler(ApplicationDbContext dbContext, ILogger<GetAllBacklogItemsHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<List<BacklogItemDto>>> Handle(GetAllBacklogItemsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching all backlog items");

            var backlogItems = await _dbContext.BacklogItems
                .AsNoTracking()
                .Select(bi => new BacklogItemDto
                {
                    Id = bi.Id,
                    Title = bi.Title,
                    Description = bi.Description,
                    Category = bi.Category,
                    EstimatedHours = bi.EstimatedHours,
                    IsArchived = bi.IsArchived,
                    CreatedAt = bi.CreatedAt
                })
                .OrderByDescending(bi => bi.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Successfully fetched {Count} backlog items", backlogItems.Count);
            return Result<List<BacklogItemDto>>.Ok(backlogItems, $"Retrieved {backlogItems.Count} backlog items");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching backlog items");
            return Result<List<BacklogItemDto>>.Fail("Failed to retrieve backlog items");
        }
    }
}

/// <summary>
/// Handler for retrieving a specific backlog item by ID
/// </summary>
public class GetBacklogItemByIdHandler : IRequestHandler<GetBacklogItemByIdQuery, Result<BacklogItemDto>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<GetBacklogItemByIdHandler> _logger;

    public GetBacklogItemByIdHandler(ApplicationDbContext dbContext, ILogger<GetBacklogItemByIdHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<BacklogItemDto>> Handle(GetBacklogItemByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching backlog item with ID: {Id}", request.Id);

            var backlogItem = await _dbContext.BacklogItems
                .AsNoTracking()
                .FirstOrDefaultAsync(bi => bi.Id == request.Id, cancellationToken);

            if (backlogItem == null)
            {
                _logger.LogWarning("Backlog item with ID {Id} not found", request.Id);
                return Result<BacklogItemDto>.Fail("Backlog item not found");
            }

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

            _logger.LogInformation("Successfully retrieved backlog item {Id}", request.Id);
            return Result<BacklogItemDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching backlog item {Id}", request.Id);
            return Result<BacklogItemDto>.Fail("Failed to retrieve backlog item");
        }
    }
}

/// <summary>
/// Handler for retrieving active (non-archived) backlog items
/// </summary>
public class GetActiveBacklogItemsHandler : IRequestHandler<GetActiveBacklogItemsQuery, Result<List<BacklogItemDto>>>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<GetActiveBacklogItemsHandler> _logger;

    public GetActiveBacklogItemsHandler(ApplicationDbContext dbContext, ILogger<GetActiveBacklogItemsHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<List<BacklogItemDto>>> Handle(GetActiveBacklogItemsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching active backlog items");

            var backlogItems = await _dbContext.BacklogItems
                .AsNoTracking()
                .Where(bi => !bi.IsArchived)
                .Select(bi => new BacklogItemDto
                {
                    Id = bi.Id,
                    Title = bi.Title,
                    Description = bi.Description,
                    Category = bi.Category,
                    EstimatedHours = bi.EstimatedHours,
                    IsArchived = bi.IsArchived,
                    CreatedAt = bi.CreatedAt
                })
                .OrderByDescending(bi => bi.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Successfully fetched {Count} active backlog items", backlogItems.Count);
            return Result<List<BacklogItemDto>>.Ok(backlogItems, $"Retrieved {backlogItems.Count} active backlog items");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching active backlog items");
            return Result<List<BacklogItemDto>>.Fail("Failed to retrieve active backlog items");
        }
    }
}
