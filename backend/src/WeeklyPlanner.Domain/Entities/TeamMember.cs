namespace WeeklyPlanner.Domain.Entities;

/// <summary>
/// Represents a team member who can participate in weekly planning
/// </summary>
public class TeamMember
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public int Role { get; private set; } // 1=TeamMember, 2=TeamLead
    public DateTime CreatedAt { get; private set; }

    private TeamMember() { }

    public TeamMember(string name, int role = 1)
    {
        Id = Guid.NewGuid();
        Name = name;
        Role = role;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateName(string name)
    {
        Name = name;
    }

    public void SetRole(int role)
    {
        if (role < 1 || role > 2)
            throw new InvalidOperationException("Invalid role. Must be 1 (TeamMember) or 2 (TeamLead)");
        Role = role;
    }

    public void PromoteToLead()
    {
        Role = 2;
    }

    public void DemoteToMember()
    {
        Role = 1;
    }

    public bool IsLead => Role == 2;
}
