using Xunit;
using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.UnitTests.Domain;

public class BacklogItemTests
{
    [Fact]
    public void Constructor_CreatesBacklogItemWithValidData()
    {
        // Arrange
        var title = "Fix authentication bug";
        var description = "Implement JWT bearer tokens";
        var category = 2;  // TechDebt
        var estimatedHours = 8m;

        // Act
        var backlogItem = new BacklogItem(title, description, category, estimatedHours);

        // Assert
        Assert.NotEqual(Guid.Empty, backlogItem.Id);
        Assert.Equal(title, backlogItem.Title);
        Assert.Equal(description, backlogItem.Description);
        Assert.Equal(category, backlogItem.Category);
        Assert.Equal(estimatedHours, backlogItem.EstimatedHours);
        Assert.False(backlogItem.IsArchived);
        Assert.True(backlogItem.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Archive_SetsIsArchivedToTrue()
    {
        // Arrange
        var backlogItem = new BacklogItem("Title", "Description", 1, 5);
        Assert.False(backlogItem.IsArchived);

        // Act
        backlogItem.Archive();

        // Assert
        Assert.True(backlogItem.IsArchived);
    }

    [Fact]
    public void Update_UpdatesEntityProperties()
    {
        // Arrange
        var backlogItem = new BacklogItem("Old Title", "Old Description", 1, 5);
        var newTitle = "New Title";
        var newDescription = "New Description";
        var newCategory = 2;
        var newHours = 10m;

        // Act
        backlogItem.Update(newTitle, newDescription, newCategory, newHours);

        // Assert
        Assert.Equal(newTitle, backlogItem.Title);
        Assert.Equal(newDescription, backlogItem.Description);
        Assert.Equal(newCategory, backlogItem.Category);
        Assert.Equal(newHours, backlogItem.EstimatedHours);
    }
}
