namespace WeeklyPlanner.Domain.Entities;

/// <summary>
/// Represents a backlog task assigned to a member within a planning week
/// </summary>
public class MemberTask
{
    public Guid Id { get; private set; }
    public Guid WeekMemberId { get; private set; }
    public Guid BacklogItemId { get; private set; }
    public decimal PlannedHours { get; private set; }
    public decimal ActualHours { get; private set; }
    public int ProgressPercent { get; private set; }

    // Navigation properties
    public WeekMember WeekMember { get; private set; } = null!;
    public BacklogItem BacklogItem { get; private set; } = null!;

    private MemberTask() { }

    public MemberTask(Guid weekMemberId, Guid backlogItemId, decimal plannedHours)
    {
        Id = Guid.NewGuid();
        WeekMemberId = weekMemberId;
        BacklogItemId = backlogItemId;
        PlannedHours = plannedHours;
        ActualHours = 0;
        ProgressPercent = 0;
    }

    public void UpdatePlannedHours(decimal hours)
    {
        if (hours < 0)
            throw new InvalidOperationException("Planned hours cannot be negative");
        PlannedHours = hours;
    }

    public void UpdateProgress(decimal actualHours, int progressPercent)
    {
        if (actualHours < 0)
            throw new InvalidOperationException("Actual hours cannot be negative");
        if (progressPercent < 0 || progressPercent > 100)
            throw new InvalidOperationException("Progress must be between 0 and 100");
        ActualHours = actualHours;
        ProgressPercent = progressPercent;
    }
}
