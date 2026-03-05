using MediatR;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.Application.Commands;

public class CreateTeamMemberCommand : IRequest<Result<TeamMemberDto>>
{
    public CreateTeamMemberRequest Request { get; set; } = null!;

    public CreateTeamMemberCommand(CreateTeamMemberRequest request)
    {
        Request = request;
    }
}

public class UpdateTeamMemberCommand : IRequest<Result<TeamMemberDto>>
{
    public Guid Id { get; set; }
    public UpdateTeamMemberRequest Request { get; set; } = null!;

    public UpdateTeamMemberCommand(Guid id, UpdateTeamMemberRequest request)
    {
        Id = id;
        Request = request;
    }
}

public class DeleteTeamMemberCommand : IRequest<Result<bool>>
{
    public Guid Id { get; set; }

    public DeleteTeamMemberCommand(Guid id)
    {
        Id = id;
    }
}

public class SetTeamLeadCommand : IRequest<Result<TeamMemberDto>>
{
    public Guid Id { get; set; }

    public SetTeamLeadCommand(Guid id)
    {
        Id = id;
    }
}
