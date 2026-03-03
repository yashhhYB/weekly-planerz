using MediatR;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.Application.Commands;

/// <summary>
/// Command to create a new planning week
/// </summary>
public class CreatePlanningWeekCommand : IRequest<Result<PlanningWeekDto>>
{
    public CreatePlanningWeekRequest Request { get; set; }

    public CreatePlanningWeekCommand(CreatePlanningWeekRequest request)
    {
        Request = request;
    }
}

/// <summary>
/// Command to update a planning week
/// </summary>
public class UpdatePlanningWeekCommand : IRequest<Result<PlanningWeekDto>>
{
    public Guid Id { get; set; }
    public UpdatePlanningWeekRequest Request { get; set; }

    public UpdatePlanningWeekCommand(Guid id, UpdatePlanningWeekRequest request)
    {
        Id = id;
        Request = request;
    }
}

/// <summary>
/// Command to freeze a planning week
/// </summary>
public class FreezePlanningWeekCommand : IRequest<Result<PlanningWeekDto>>
{
    public Guid Id { get; set; }

    public FreezePlanningWeekCommand(Guid id)
    {
        Id = id;
    }
}

/// <summary>
/// Command to delete a planning week
/// </summary>
public class DeletePlanningWeekCommand : IRequest<Result<bool>>
{
    public Guid Id { get; set; }

    public DeletePlanningWeekCommand(Guid id)
    {
        Id = id;
    }
}
