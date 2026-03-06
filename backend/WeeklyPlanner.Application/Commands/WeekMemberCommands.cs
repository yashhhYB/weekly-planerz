using MediatR;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.Application.Commands;

/// <summary>
/// Add members to a planning week
/// </summary>
public class AddWeekMembersCommand : IRequest<Result<List<WeekMemberDto>>>
{
    public Guid WeekId { get; set; }
    public List<Guid> MemberIds { get; set; } = new();

    public AddWeekMembersCommand(Guid weekId, List<Guid> memberIds)
    {
        WeekId = weekId;
        MemberIds = memberIds;
    }
}

/// <summary>
/// Assign a backlog task to a member for a given week
/// </summary>
public class AssignTaskCommand : IRequest<Result<MemberTaskDto>>
{
    public Guid WeekMemberId { get; set; }
    public AssignTaskRequest Request { get; set; } = null!;

    public AssignTaskCommand(Guid weekMemberId, AssignTaskRequest request)
    {
        WeekMemberId = weekMemberId;
        Request = request;
    }
}

/// <summary>
/// Remove an assigned task
/// </summary>
public class RemoveTaskCommand : IRequest<Result<bool>>
{
    public Guid TaskId { get; set; }

    public RemoveTaskCommand(Guid taskId)
    {
        TaskId = taskId;
    }
}

/// <summary>
/// Submit a member's plan (must total 30 hours)
/// </summary>
public class SubmitMemberPlanCommand : IRequest<Result<WeekMemberDto>>
{
    public Guid WeekMemberId { get; set; }

    public SubmitMemberPlanCommand(Guid weekMemberId)
    {
        WeekMemberId = weekMemberId;
    }
}

/// <summary>
/// Unsubmit a member's plan (toggle back to editable)
/// </summary>
public class UnsubmitMemberPlanCommand : IRequest<Result<WeekMemberDto>>
{
    public Guid WeekMemberId { get; set; }

    public UnsubmitMemberPlanCommand(Guid weekMemberId)
    {
        WeekMemberId = weekMemberId;
    }
}

/// <summary>
/// Update task progress (actual hours + progress %)
/// </summary>
public class UpdateTaskProgressCommand : IRequest<Result<MemberTaskDto>>
{
    public Guid TaskId { get; set; }
    public UpdateProgressRequest Request { get; set; } = null!;

    public UpdateTaskProgressCommand(Guid taskId, UpdateProgressRequest request)
    {
        TaskId = taskId;
        Request = request;
    }
}
