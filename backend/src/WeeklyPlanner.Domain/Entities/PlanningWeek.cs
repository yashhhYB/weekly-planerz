namespace WeeklyPlanner.Domain.Entities;

/// <summary>
/// Represents a planning week (created on Tuesday, runs Wed-Mon)
/// </summary>
public class PlanningWeek
{
    public Guid Id { get; private set; }
    public DateTime PlanningDate { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public int Status { get; private set; }
    public bool IsFrozen { get; private set; }
    public decimal ClientPercent { get; private set; }
    public decimal TechDebtPercent { get; private set; }
    public decimal RndPercent { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private PlanningWeek() { }

    public PlanningWeek(
        DateTime planningDate,
        decimal clientPercent,
        decimal techDebtPercent,
        decimal rndPercent)
    {
        // Validate Tuesday
        if (planningDate.DayOfWeek != DayOfWeek.Tuesday)
            throw new InvalidOperationException("Planning can only be created on Tuesday");

        // Validate percentages sum to 100
        var total = clientPercent + techDebtPercent + rndPercent;
        if (Math.Abs(total - 100m) > 0.01m)
            throw new InvalidOperationException("Category percentages must sum to exactly 100%");

        Id = Guid.NewGuid();
        PlanningDate = planningDate;
        StartDate = planningDate.AddDays(1);  // Wednesday
        EndDate = planningDate.AddDays(6);     // Monday next week
        Status = 1;  // Setup
        IsFrozen = false;
        ClientPercent = clientPercent;
        TechDebtPercent = techDebtPercent;
        RndPercent = rndPercent;
        CreatedAt = DateTime.UtcNow;
    }

    public void Freeze()
    {
        IsFrozen = true;
    }

    public decimal GetClientHours() => 30 * (ClientPercent / 100);
    public decimal GetTechDebtHours() => 30 * (TechDebtPercent / 100);
    public decimal GetRndHours() => 30 * (RndPercent / 100);
}
