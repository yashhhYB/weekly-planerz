using MediatR;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Queries;

/// <summary>
/// Get all members assigned to a planning week
/// </summary>
public class GetWeekMembersQuery : IRequest<Result<List<WeekMemberDto>>>
{
    public Guid WeekId { get; set; }

    public GetWeekMembersQuery(Guid weekId)
    {
        WeekId = weekId;
    }
}

/// <summary>
/// Get a specific week member with their tasks
/// </summary>
public class GetWeekMemberByIdQuery : IRequest<Result<WeekMemberDto>>
{
    public Guid Id { get; set; }

    public GetWeekMemberByIdQuery(Guid id)
    {
        Id = id;
    }
}

/// <summary>
/// Get dashboard data for a planning week
/// </summary>
public class GetDashboardQuery : IRequest<Result<DashboardDto>>
{
    public Guid WeekId { get; set; }

    public GetDashboardQuery(Guid weekId)
    {
        WeekId = weekId;
    }
}
