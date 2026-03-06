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
    public DbSet<TeamMember> TeamMembers { get; set; } = null!;
    public DbSet<WeekMember> WeekMembers { get; set; } = null!;
    public DbSet<MemberTask> MemberTasks { get; set; } = null!;

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

        // Configure TeamMember entity
        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Configure WeekMember entity
        modelBuilder.Entity<WeekMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.TotalPlannedHours).HasPrecision(6, 1);
            entity.Property(e => e.TotalActualHours).HasPrecision(6, 1);
            entity.Property(e => e.HasSubmitted).HasDefaultValue(false);

            entity.HasOne(e => e.Week)
                .WithMany()
                .HasForeignKey(e => e.WeekId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Member)
                .WithMany()
                .HasForeignKey(e => e.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.WeekId, e.MemberId }).IsUnique();
        });

        // Configure MemberTask entity
        modelBuilder.Entity<MemberTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.PlannedHours).HasPrecision(6, 1);
            entity.Property(e => e.ActualHours).HasPrecision(6, 1);
            entity.Property(e => e.ProgressPercent).HasDefaultValue(0);

            entity.HasOne(e => e.WeekMember)
                .WithMany(wm => wm.Tasks)
                .HasForeignKey(e => e.WeekMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.BacklogItem)
                .WithMany()
                .HasForeignKey(e => e.BacklogItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.WeekMemberId, e.BacklogItemId }).IsUnique();
        });
    }
}
