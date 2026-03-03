using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets for domain entities
    public DbSet<PlanningWeek> PlanningWeeks { get; set; } = null!;
    public DbSet<BacklogItem> BacklogItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure PlanningWeek entity
        modelBuilder.Entity<PlanningWeek>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Id)
                .ValueGeneratedNever();
            
            entity.Property(e => e.PlanningDate)
                .IsRequired();
            
            entity.Property(e => e.StartDate)
                .IsRequired();
            
            entity.Property(e => e.EndDate)
                .IsRequired();
            
            entity.Property(e => e.Status)
                .IsRequired();
            
            entity.Property(e => e.IsFrozen)
                .HasDefaultValue(false);
            
            entity.Property(e => e.ClientPercent)
                .HasPrecision(5, 2);
            
            entity.Property(e => e.TechDebtPercent)
                .HasPrecision(5, 2);
            
            entity.Property(e => e.RndPercent)
                .HasPrecision(5, 2);
            
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Index for date ranges
            entity.HasIndex(e => e.PlanningDate)
                .IsUnique();
            
            entity.HasIndex(e => new { e.StartDate, e.EndDate });
        });

        // Configure BacklogItem entity
        modelBuilder.Entity<BacklogItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Id)
                .ValueGeneratedNever();
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.Description)
                .HasMaxLength(2000);
            
            entity.Property(e => e.Category)
                .IsRequired();
            
            entity.Property(e => e.EstimatedHours)
                .HasPrecision(6, 1);
            
            entity.Property(e => e.IsArchived)
                .HasDefaultValue(false);
            
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Index for archived and category
            entity.HasIndex(e => e.IsArchived);
            entity.HasIndex(e => e.Category);
        });
    }
}
