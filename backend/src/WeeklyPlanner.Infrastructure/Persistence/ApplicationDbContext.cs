using Microsoft.EntityFrameworkCore;

namespace WeeklyPlanner.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // All entity configurations will be added here
        // For now, leaving as template
    }
}
