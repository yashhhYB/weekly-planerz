namespace WeeklyPlanner.Domain.Entities;

/// <summary>
/// Represents a team member's participation in a planning week
/// </summary>
public class WeekMember
{
    public Guid Id { get; private set; }
    public Guid WeekId { get; private set; }
    public Guid MemberId { get; private set; }
    public decimal TotalPlannedHours { get; private set; }
    public decimal TotalActualHours { get; private set; }
    public bool HasSubmitted { get; private set; }

    // Navigation properties
    public PlanningWeek Week { get; private set; } = null!;
    public TeamMember Member { get; private set; } = null!;
    public List<MemberTask> Tasks { get; private set; } = new();

    private WeekMember() { }

    public WeekMember(Guid weekId, Guid memberId)
    {
        Id = Guid.NewGuid();
        WeekId = weekId;
        MemberId = memberId;
        TotalPlannedHours = 0;
        TotalActualHours = 0;
        HasSubmitted = false;
    }

    public void RecalculateHours()
    {
        TotalPlannedHours = Tasks.Sum(t => t.PlannedHours);
        TotalActualHours = Tasks.Sum(t => t.ActualHours);
    }

    public void Submit()
    {
        if (TotalPlannedHours != 30)
            throw new InvalidOperationException("Total planned hours must be exactly 30 before submitting");
        HasSubmitted = true;
    }

    public void Unsubmit()
    {
        HasSubmitted = false;
    }
}
