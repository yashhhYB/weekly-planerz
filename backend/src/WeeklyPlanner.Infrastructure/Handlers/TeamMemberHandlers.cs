using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.Application.Commands;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.Application.Handlers;

public class CreateTeamMemberHandler : IRequestHandler<CreateTeamMemberCommand, Result<TeamMemberDto>>
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<CreateTeamMemberHandler> _logger;

    public CreateTeamMemberHandler(ApplicationDbContext db, ILogger<CreateTeamMemberHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<TeamMemberDto>> Handle(CreateTeamMemberCommand request, CancellationToken ct)
    {
        try
        {
            // First member automatically becomes lead
            var existingCount = await _db.TeamMembers.CountAsync(ct);
            var role = existingCount == 0 ? 2 : request.Request.Role;

            // Only one lead allowed — if setting as lead, demote current lead
            if (role == 2)
            {
                var currentLead = await _db.TeamMembers.FirstOrDefaultAsync(m => m.Role == 2, ct);
                if (currentLead != null)
                {
                    currentLead.DemoteToMember();
                }
            }

            var member = new TeamMember(request.Request.Name, role);
            _db.TeamMembers.Add(member);
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation("Created team member {Name} with role {Role}", member.Name, member.Role);

            return Result<TeamMemberDto>.Ok(MapToDto(member), "Team member created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating team member");
            return Result<TeamMemberDto>.Fail("Failed to create team member");
        }
    }

    private static TeamMemberDto MapToDto(TeamMember m) => new()
    {
        Id = m.Id, Name = m.Name, Role = m.Role, CreatedAt = m.CreatedAt
    };
}

public class UpdateTeamMemberHandler : IRequestHandler<UpdateTeamMemberCommand, Result<TeamMemberDto>>
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<UpdateTeamMemberHandler> _logger;

    public UpdateTeamMemberHandler(ApplicationDbContext db, ILogger<UpdateTeamMemberHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<TeamMemberDto>> Handle(UpdateTeamMemberCommand request, CancellationToken ct)
    {
        try
        {
            var member = await _db.TeamMembers.FindAsync(new object[] { request.Id }, ct);
            if (member == null) return Result<TeamMemberDto>.Fail("Team member not found");

            member.UpdateName(request.Request.Name);
            await _db.SaveChangesAsync(ct);

            return Result<TeamMemberDto>.Ok(new TeamMemberDto
            {
                Id = member.Id, Name = member.Name, Role = member.Role, CreatedAt = member.CreatedAt
            }, "Team member updated");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team member");
            return Result<TeamMemberDto>.Fail("Failed to update team member");
        }
    }
}

public class DeleteTeamMemberHandler : IRequestHandler<DeleteTeamMemberCommand, Result<bool>>
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<DeleteTeamMemberHandler> _logger;

    public DeleteTeamMemberHandler(ApplicationDbContext db, ILogger<DeleteTeamMemberHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteTeamMemberCommand request, CancellationToken ct)
    {
        try
        {
            var member = await _db.TeamMembers.FindAsync(new object[] { request.Id }, ct);
            if (member == null) return Result<bool>.Fail("Team member not found");

            var totalCount = await _db.TeamMembers.CountAsync(ct);
            if (totalCount <= 1) return Result<bool>.Fail("Cannot remove the last team member");

            if (member.IsLead)
                return Result<bool>.Fail("Cannot remove the team lead. Assign a new lead first.");

            _db.TeamMembers.Remove(member);
            await _db.SaveChangesAsync(ct);

            return Result<bool>.Ok(true, "Team member removed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting team member");
            return Result<bool>.Fail("Failed to delete team member");
        }
    }
}

public class SetTeamLeadHandler : IRequestHandler<SetTeamLeadCommand, Result<TeamMemberDto>>
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<SetTeamLeadHandler> _logger;

    public SetTeamLeadHandler(ApplicationDbContext db, ILogger<SetTeamLeadHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<TeamMemberDto>> Handle(SetTeamLeadCommand request, CancellationToken ct)
    {
        try
        {
            var member = await _db.TeamMembers.FindAsync(new object[] { request.Id }, ct);
            if (member == null) return Result<TeamMemberDto>.Fail("Team member not found");

            // Demote current lead
            var currentLead = await _db.TeamMembers.FirstOrDefaultAsync(m => m.Role == 2 && m.Id != request.Id, ct);
            if (currentLead != null) currentLead.DemoteToMember();

            member.PromoteToLead();
            await _db.SaveChangesAsync(ct);

            return Result<TeamMemberDto>.Ok(new TeamMemberDto
            {
                Id = member.Id, Name = member.Name, Role = member.Role, CreatedAt = member.CreatedAt
            }, "Team lead updated");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting team lead");
            return Result<TeamMemberDto>.Fail("Failed to set team lead");
        }
    }
}

public class GetAllTeamMembersHandler : IRequestHandler<GetAllTeamMembersQuery, Result<List<TeamMemberDto>>>
{
    private readonly ApplicationDbContext _db;

    public GetAllTeamMembersHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<List<TeamMemberDto>>> Handle(GetAllTeamMembersQuery request, CancellationToken ct)
    {
        var members = await _db.TeamMembers
            .OrderByDescending(m => m.Role)
            .ThenBy(m => m.Name)
            .Select(m => new TeamMemberDto
            {
                Id = m.Id, Name = m.Name, Role = m.Role, CreatedAt = m.CreatedAt
            })
            .ToListAsync(ct);

        return Result<List<TeamMemberDto>>.Ok(members);
    }
}

public class GetTeamMemberByIdHandler : IRequestHandler<GetTeamMemberByIdQuery, Result<TeamMemberDto>>
{
    private readonly ApplicationDbContext _db;

    public GetTeamMemberByIdHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<TeamMemberDto>> Handle(GetTeamMemberByIdQuery request, CancellationToken ct)
    {
        var member = await _db.TeamMembers.FindAsync(new object[] { request.Id }, ct);
        if (member == null) return Result<TeamMemberDto>.Fail("Team member not found");

        return Result<TeamMemberDto>.Ok(new TeamMemberDto
        {
            Id = member.Id, Name = member.Name, Role = member.Role, CreatedAt = member.CreatedAt
        });
    }
}
