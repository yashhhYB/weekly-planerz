namespace WeeklyPlanner.Domain.Entities;

/// <summary>
/// Represents a backlog item that can be assigned to planning weeks
/// </summary>
public class BacklogItem
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int Category { get; private set; }
    public decimal EstimatedHours { get; private set; }
    public bool IsArchived { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private BacklogItem() { }

    public BacklogItem(string title, string description, int category, decimal estimatedHours)
    {
        Id = Guid.NewGuid();
        Title = title;
        Description = description;
        Category = category;
        EstimatedHours = estimatedHours;
        IsArchived = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        IsArchived = true;
    }

    public void Update(string title, string description, decimal estimatedHours)
    {
        Title = title;
        Description = description;
        EstimatedHours = estimatedHours;
    }
}
