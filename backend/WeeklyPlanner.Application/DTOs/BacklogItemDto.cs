namespace WeeklyPlanner.Application.DTOs;

/// <summary>
/// DTO for BacklogItem responses
/// </summary>
public class BacklogItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Category { get; set; }
    public decimal EstimatedHours { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new backlog item
/// </summary>
public class CreateBacklogItemRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Category { get; set; }
    public decimal EstimatedHours { get; set; }
}

/// <summary>
/// DTO for updating a backlog item
/// </summary>
public class UpdateBacklogItemRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Category { get; set; }
    public decimal EstimatedHours { get; set; }
}
