using MediatR;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.Application.Queries;

/// <summary>
/// Query to retrieve all backlog items
/// </summary>
public class GetAllBacklogItemsQuery : IRequest<Result<List<BacklogItemDto>>>
{
}

/// <summary>
/// Query to retrieve a specific backlog item by ID
/// </summary>
public class GetBacklogItemByIdQuery : IRequest<Result<BacklogItemDto>>
{
    public Guid Id { get; set; }

    public GetBacklogItemByIdQuery(Guid id)
    {
        Id = id;
    }
}

/// <summary>
/// Query to retrieve non-archived backlog items
/// </summary>
public class GetActiveBacklogItemsQuery : IRequest<Result<List<BacklogItemDto>>>
{
}
