namespace WeeklyPlanner.Domain.Enums;

/// <summary>
/// Backlog item category for classification
/// </summary>
public enum BacklogItemCategory
{
    ClientFocused = 1,
    TechDebt = 2,
    RnD = 3
}

/// <summary>
/// Planning week status
/// </summary>
public enum PlanningStatus
{
    Setup = 1,
    InProgress = 2,
    Completed = 3,
    Archived = 4
}

/// <summary>
/// User roles in the system
/// </summary>
public enum UserRole
{
    TeamMember = 1,
    TeamLead = 2,
    Admin = 3
}
