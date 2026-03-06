using MediatR;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.Application.Commands;

/// <summary>
/// Command to create a new backlog item
/// </summary>
public class CreateBacklogItemCommand : IRequest<Result<BacklogItemDto>>
{
    public CreateBacklogItemRequest Request { get; set; }

    public CreateBacklogItemCommand(CreateBacklogItemRequest request)
    {
        Request = request;
    }
}

/// <summary>
/// Command to update a backlog item
/// </summary>
public class UpdateBacklogItemCommand : IRequest<Result<BacklogItemDto>>
{
    public Guid Id { get; set; }
    public UpdateBacklogItemRequest Request { get; set; }

    public UpdateBacklogItemCommand(Guid id, UpdateBacklogItemRequest request)
    {
        Id = id;
        Request = request;
    }
}

/// <summary>
/// Command to archive a backlog item
/// </summary>
public class ArchiveBacklogItemCommand : IRequest<Result<BacklogItemDto>>
{
    public Guid Id { get; set; }

    public ArchiveBacklogItemCommand(Guid id)
    {
        Id = id;
    }
}

/// <summary>
/// Command to delete a backlog item
/// </summary>
public class DeleteBacklogItemCommand : IRequest<Result<bool>>
{
    public Guid Id { get; set; }

    public DeleteBacklogItemCommand(Guid id)
    {
        Id = id;
    }
}
