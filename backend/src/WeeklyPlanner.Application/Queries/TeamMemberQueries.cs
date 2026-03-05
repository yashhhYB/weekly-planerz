using MediatR;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Queries;

public class GetAllTeamMembersQuery : IRequest<Result<List<TeamMemberDto>>>
{
}

public class GetTeamMemberByIdQuery : IRequest<Result<TeamMemberDto>>
{
    public Guid Id { get; set; }

    public GetTeamMemberByIdQuery(Guid id)
    {
        Id = id;
    }
}
