using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext db, ILogger<AdminController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Export all application data as JSON
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export(CancellationToken ct)
    {
        var teamMembers = await _db.TeamMembers.OrderBy(m => m.CreatedAt).ToListAsync(ct);
        var backlogItems = await _db.BacklogItems.OrderBy(b => b.CreatedAt).ToListAsync(ct);
        var planningWeeks = await _db.PlanningWeeks.OrderBy(w => w.CreatedAt).ToListAsync(ct);
        var weekMembers = await _db.WeekMembers.OrderBy(wm => wm.WeekId).ToListAsync(ct);
        var memberTasks = await _db.MemberTasks.ToListAsync(ct);

        var export = new
        {
            appName = "WeeklyPlanTracker",
            dataVersion = 1,
            exportedAt = DateTime.UtcNow,
            data = new
            {
                teamMembers = teamMembers.Select(m => new
                {
                    m.Id, m.Name, m.Role, m.CreatedAt
                }),
                backlogItems = backlogItems.Select(b => new
                {
                    b.Id, b.Title, b.Description, b.Category,
                    b.EstimatedHours, b.IsArchived, b.CreatedAt
                }),
                planningWeeks = planningWeeks.Select(w => new
                {
                    w.Id, w.PlanningDate, w.StartDate, w.EndDate,
                    w.Status, w.IsFrozen,
                    w.ClientPercent, w.TechDebtPercent, w.RndPercent,
                    w.CreatedAt
                }),
                weekMembers = weekMembers.Select(wm => new
                {
                    wm.Id, wm.WeekId, wm.MemberId,
                    wm.TotalPlannedHours, wm.TotalActualHours,
                    wm.HasSubmitted
                }),
                memberTasks = memberTasks.Select(mt => new
                {
                    mt.Id, mt.WeekMemberId, mt.BacklogItemId,
                    mt.PlannedHours, mt.ActualHours, mt.ProgressPercent
                })
            }
        };

        return Ok(export);
    }

    /// <summary>
    /// Import data from JSON (replaces all existing data)
    /// </summary>
    [HttpPost("import")]
    public async Task<IActionResult> Import([FromBody] ImportPayload payload, CancellationToken ct)
    {
        try
        {
            // Clear all existing data (order matters for FK constraints)
            _db.MemberTasks.RemoveRange(await _db.MemberTasks.ToListAsync(ct));
            _db.WeekMembers.RemoveRange(await _db.WeekMembers.ToListAsync(ct));
            _db.PlanningWeeks.RemoveRange(await _db.PlanningWeeks.ToListAsync(ct));
            _db.BacklogItems.RemoveRange(await _db.BacklogItems.ToListAsync(ct));
            _db.TeamMembers.RemoveRange(await _db.TeamMembers.ToListAsync(ct));
            await _db.SaveChangesAsync(ct);

            // Import team members
            if (payload.TeamMembers?.Any() == true)
            {
                foreach (var m in payload.TeamMembers)
                {
                    _db.TeamMembers.Add(new TeamMember(m.Name, m.Role)
                    {
                        // Use reflection to set Id since it's private
                    });
                }
                // Use raw SQL for exact ID preservation
                _db.ChangeTracker.Clear();

                foreach (var m in payload.TeamMembers)
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "INSERT INTO TeamMembers (Id, Name, Role, CreatedAt) VALUES ({0}, {1}, {2}, {3})",
                        m.Id, m.Name, m.Role, m.CreatedAt ?? DateTime.UtcNow);
                }
            }

            // Import backlog items
            if (payload.BacklogItems?.Any() == true)
            {
                foreach (var b in payload.BacklogItems)
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "INSERT INTO BacklogItems (Id, Title, Description, Category, EstimatedHours, IsArchived, CreatedAt) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                        b.Id, b.Title, b.Description ?? "", b.Category, b.EstimatedHours, b.IsArchived ? 1 : 0, b.CreatedAt ?? DateTime.UtcNow);
                }
            }

            // Import planning weeks
            if (payload.PlanningWeeks?.Any() == true)
            {
                foreach (var w in payload.PlanningWeeks)
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "INSERT INTO PlanningWeeks (Id, PlanningDate, StartDate, EndDate, Status, IsFrozen, ClientPercent, TechDebtPercent, RndPercent, CreatedAt) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9})",
                        w.Id, w.PlanningDate, w.StartDate, w.EndDate, w.Status, w.IsFrozen ? 1 : 0,
                        w.ClientPercent, w.TechDebtPercent, w.RndPercent, w.CreatedAt ?? DateTime.UtcNow);
                }
            }

            // Import week members
            if (payload.WeekMembers?.Any() == true)
            {
                foreach (var wm in payload.WeekMembers)
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "INSERT INTO WeekMembers (Id, WeekId, MemberId, TotalPlannedHours, TotalActualHours, HasSubmitted) VALUES ({0}, {1}, {2}, {3}, {4}, {5})",
                        wm.Id, wm.WeekId, wm.MemberId, wm.TotalPlannedHours, wm.TotalActualHours, wm.HasSubmitted ? 1 : 0);
                }
            }

            // Import member tasks
            if (payload.MemberTasks?.Any() == true)
            {
                foreach (var mt in payload.MemberTasks)
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "INSERT INTO MemberTasks (Id, WeekMemberId, BacklogItemId, PlannedHours, ActualHours, ProgressPercent) VALUES ({0}, {1}, {2}, {3}, {4}, {5})",
                        mt.Id, mt.WeekMemberId, mt.BacklogItemId, mt.PlannedHours, mt.ActualHours, mt.ProgressPercent);
                }
            }

            _logger.LogInformation("Data import completed successfully");
            return Ok(new { success = true, message = "Data imported successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import data");
            return BadRequest(new { success = false, message = $"Import failed: {ex.Message}" });
        }
    }

    /// <summary>
    /// Seed sample data (clears existing data first)
    /// </summary>
    [HttpPost("seed")]
    public async Task<IActionResult> Seed(CancellationToken ct)
    {
        try
        {
            // Clear all existing data
            _db.MemberTasks.RemoveRange(await _db.MemberTasks.ToListAsync(ct));
            _db.WeekMembers.RemoveRange(await _db.WeekMembers.ToListAsync(ct));
            _db.PlanningWeeks.RemoveRange(await _db.PlanningWeeks.ToListAsync(ct));
            _db.BacklogItems.RemoveRange(await _db.BacklogItems.ToListAsync(ct));
            _db.TeamMembers.RemoveRange(await _db.TeamMembers.ToListAsync(ct));
            await _db.SaveChangesAsync(ct);

            // Create team members
            var alice = new TeamMember("Alice Chen", 2); // Lead
            var bob = new TeamMember("Bob Martinez", 1);
            var carol = new TeamMember("Carol Singh", 1);
            var dave = new TeamMember("Dave Kim", 1);

            _db.TeamMembers.AddRange(alice, bob, carol, dave);

            // Create backlog items
            var items = new[]
            {
                new BacklogItem("Customer onboarding redesign", "Revamp the onboarding flow for new customers.", 1, 12),
                new BacklogItem("Fix billing invoice formatting", "Some invoices show wrong currency format.", 1, 4),
                new BacklogItem("Customer feedback dashboard", "Build a dashboard showing NPS scores.", 1, 16),
                new BacklogItem("Migrate database to PostgreSQL 16", "Upgrade from PG 14 to PG 16.", 2, 20),
                new BacklogItem("Remove deprecated API endpoints", "Clean up v1 API routes.", 2, 8),
                new BacklogItem("Add unit tests for payment module", "Coverage is below 50%.", 2, 10),
                new BacklogItem("Experiment with LLM-based search", "Prototype semantic search using embeddings.", 3, 15),
                new BacklogItem("Evaluate new caching strategy", "Compare Redis Cluster vs Memcached.", 3, 6),
                new BacklogItem("Build internal CLI tool", "A command-line tool for common dev tasks.", 3, 8),
                new BacklogItem("Client SSO integration", "Support SAML-based single sign-on for enterprise clients.", 1, 18)
            };

            _db.BacklogItems.AddRange(items);
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation("Sample data seeded: 4 members, 10 backlog items");
            return Ok(new { success = true, message = "Sample data seeded: 4 members, 10 backlog items" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed data");
            return BadRequest(new { success = false, message = $"Seed failed: {ex.Message}" });
        }
    }

    /// <summary>
    /// Reset all application data
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> Reset(CancellationToken ct)
    {
        try
        {
            _db.MemberTasks.RemoveRange(await _db.MemberTasks.ToListAsync(ct));
            _db.WeekMembers.RemoveRange(await _db.WeekMembers.ToListAsync(ct));
            _db.PlanningWeeks.RemoveRange(await _db.PlanningWeeks.ToListAsync(ct));
            _db.BacklogItems.RemoveRange(await _db.BacklogItems.ToListAsync(ct));
            _db.TeamMembers.RemoveRange(await _db.TeamMembers.ToListAsync(ct));
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation("All application data has been reset");
            return Ok(new { success = true, message = "All data has been reset" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reset data");
            return BadRequest(new { success = false, message = $"Reset failed: {ex.Message}" });
        }
    }
}

// DTOs for import
public class ImportPayload
{
    public List<ImportTeamMember>? TeamMembers { get; set; }
    public List<ImportBacklogItem>? BacklogItems { get; set; }
    public List<ImportPlanningWeek>? PlanningWeeks { get; set; }
    public List<ImportWeekMember>? WeekMembers { get; set; }
    public List<ImportMemberTask>? MemberTasks { get; set; }
}

public class ImportTeamMember
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public int Role { get; set; } = 1;
    public DateTime? CreatedAt { get; set; }
}

public class ImportBacklogItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public int Category { get; set; }
    public decimal EstimatedHours { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class ImportPlanningWeek
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
    public DateTime? CreatedAt { get; set; }
}

public class ImportWeekMember
{
    public Guid Id { get; set; }
    public Guid WeekId { get; set; }
    public Guid MemberId { get; set; }
    public decimal TotalPlannedHours { get; set; }
    public decimal TotalActualHours { get; set; }
    public bool HasSubmitted { get; set; }
}

public class ImportMemberTask
{
    public Guid Id { get; set; }
    public Guid WeekMemberId { get; set; }
    public Guid BacklogItemId { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal ActualHours { get; set; }
    public int ProgressPercent { get; set; }
}
