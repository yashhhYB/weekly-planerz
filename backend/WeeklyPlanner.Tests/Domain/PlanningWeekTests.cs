using Xunit;
using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.UnitTests.Domain;

public class PlanningWeekTests
{
    [Fact]
    public void Constructor_WhenTuesday_CreatesSuccessfully()
    {
        // Arrange
        var tuesday = new DateTime(2026, 3, 3);  // This is a Tuesday

        // Act
        var planningWeek = new PlanningWeek(tuesday, 50, 30, 20);

        // Assert
        Assert.Equal(tuesday, planningWeek.PlanningDate);
        Assert.Equal(tuesday.AddDays(1), planningWeek.StartDate);
        Assert.Equal(tuesday.AddDays(6), planningWeek.EndDate);
        Assert.False(planningWeek.IsFrozen);
        Assert.Equal(50, planningWeek.ClientPercent);
    }

    [Fact]
    public void Constructor_WhenNotTuesday_ThrowsException()
    {
        // Arrange
        var monday = new DateTime(2026, 3, 2);  // This is Monday

        // Act & Assert
        var ex = Assert.Throws<InvalidOperationException>(() =>
            new PlanningWeek(monday, 50, 30, 20));

        Assert.Equal("Planning can only be created on Tuesday", ex.Message);
    }

    [Fact]
    public void Constructor_WhenPercentagesNot100_ThrowsException()
    {
        // Arrange
        var tuesday = new DateTime(2026, 3, 3);

        // Act & Assert
        var ex = Assert.Throws<InvalidOperationException>(() =>
            new PlanningWeek(tuesday, 50, 30, 19));  // Only 99%

        Assert.Equal("Category percentages must sum to exactly 100%", ex.Message);
    }

    [Fact]
    public void GetClientHours_ReturnsCorrectValue()
    {
        // Arrange
        var tuesday = new DateTime(2026, 3, 3);
        var planningWeek = new PlanningWeek(tuesday, 50, 30, 20);

        // Act
        var clientHours = planningWeek.GetClientHours();

        // Assert
        Assert.Equal(15m, clientHours);  // 30 * (50 / 100)
    }

    [Fact]
    public void GetTechDebtHours_ReturnsCorrectValue()
    {
        // Arrange
        var tuesday = new DateTime(2026, 3, 3);
        var planningWeek = new PlanningWeek(tuesday, 50, 30, 20);

        // Act
        var techDebtHours = planningWeek.GetTechDebtHours();

        // Assert
        Assert.Equal(9m, techDebtHours);  // 30 * (30 / 100)
    }

    [Fact]
    public void Freeze_SetsFrozenToTrue()
    {
        // Arrange
        var tuesday = new DateTime(2026, 3, 3);
        var planningWeek = new PlanningWeek(tuesday, 50, 30, 20);
        Assert.False(planningWeek.IsFrozen);

        // Act
        planningWeek.Freeze();

        // Assert
        Assert.True(planningWeek.IsFrozen);
    }
}
