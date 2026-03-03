namespace WeeklyPlanner.Application.DTOs;

/// <summary>
/// DTO for PlanningWeek responses
/// </summary>
public class PlanningWeekDto
{
    public Guid Id { get; set; }
    public DateTime PlanningDate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int Status { get; set; }
    public bool IsFrozen { get; set; }
    public decimal ClientPercent { get; set; }
    public decimal TechDebtPercent { get; set; }
    public decimal RndPercent { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new planning week
/// </summary>
public class CreatePlanningWeekRequest
{
    public DateTime PlanningDate { get; set; }
    public decimal ClientPercent { get; set; }
    public decimal TechDebtPercent { get; set; }
    public decimal RndPercent { get; set; }
}

/// <summary>
/// DTO for updating a planning week
/// </summary>
public class UpdatePlanningWeekRequest
{
    public decimal ClientPercent { get; set; }
    public decimal TechDebtPercent { get; set; }
    public decimal RndPercent { get; set; }
}
