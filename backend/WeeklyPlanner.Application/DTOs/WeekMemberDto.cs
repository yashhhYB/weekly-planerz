namespace WeeklyPlanner.Application.DTOs;

public class WeekMemberDto
{
    public Guid Id { get; set; }
    public Guid WeekId { get; set; }
    public Guid MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public int MemberRole { get; set; }
    public decimal TotalPlannedHours { get; set; }
    public decimal TotalActualHours { get; set; }
    public bool HasSubmitted { get; set; }
    public List<MemberTaskDto> Tasks { get; set; } = new();
}

public class MemberTaskDto
{
    public Guid Id { get; set; }
    public Guid WeekMemberId { get; set; }
    public Guid BacklogItemId { get; set; }
    public string BacklogTitle { get; set; } = string.Empty;
    public int BacklogCategory { get; set; }
    public decimal EstimatedHours { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal ActualHours { get; set; }
    public int ProgressPercent { get; set; }
}

public class AssignTaskRequest
{
    public Guid BacklogItemId { get; set; }
    public decimal PlannedHours { get; set; }
}

public class UpdateProgressRequest
{
    public decimal ActualHours { get; set; }
    public int ProgressPercent { get; set; }
}

public class DashboardDto
{
    public Guid WeekId { get; set; }
    public string WeekLabel { get; set; } = string.Empty;
    public int Status { get; set; }
    public bool IsFrozen { get; set; }
    public decimal TotalPlannedHours { get; set; }
    public decimal TotalActualHours { get; set; }
    public int CompletionPercent { get; set; }
    public CategoryBreakdownDto ClientFocused { get; set; } = new();
    public CategoryBreakdownDto TechDebt { get; set; } = new();
    public CategoryBreakdownDto RnD { get; set; } = new();
    public List<MemberProgressDto> Members { get; set; } = new();
    public List<TaskProgressDto> Tasks { get; set; } = new();
}

public class CategoryBreakdownDto
{
    public decimal AllocatedPercent { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal ActualHours { get; set; }
}

public class MemberProgressDto
{
    public Guid WeekMemberId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PlannedHours { get; set; }
    public decimal ActualHours { get; set; }
    public int ProgressPercent { get; set; }
    public bool HasSubmitted { get; set; }
}

public class TaskProgressDto
{
    public string TaskTitle { get; set; } = string.Empty;
    public string MemberName { get; set; } = string.Empty;
    public decimal PlannedHours { get; set; }
    public decimal ActualHours { get; set; }
    public int ProgressPercent { get; set; }
}
