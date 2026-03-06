namespace WeeklyPlanner.Application.DTOs;

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Role { get; set; }
    public string RoleLabel => Role == 2 ? "Team Lead" : "Team Member";
    public DateTime CreatedAt { get; set; }
}

public class CreateTeamMemberRequest
{
    public string Name { get; set; } = string.Empty;
    public int Role { get; set; } = 1;
}

public class UpdateTeamMemberRequest
{
    public string Name { get; set; } = string.Empty;
}
