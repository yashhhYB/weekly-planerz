using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.Application.Commands;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.Application.Handlers;

public class AddWeekMembersHandler : IRequestHandler<AddWeekMembersCommand, Result<List<WeekMemberDto>>>
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AddWeekMembersHandler> _logger;

    public AddWeekMembersHandler(ApplicationDbContext db, ILogger<AddWeekMembersHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<List<WeekMemberDto>>> Handle(AddWeekMembersCommand request, CancellationToken ct)
    {
        try
        {
            var week = await _db.PlanningWeeks.FindAsync(new object[] { request.WeekId }, ct);
            if (week == null) return Result<List<WeekMemberDto>>.Fail("Planning week not found");

            // Remove existing week members not in the new list
            var existing = await _db.WeekMembers
                .Where(wm => wm.WeekId == request.WeekId)
                .ToListAsync(ct);

            var toRemove = existing.Where(e => !request.MemberIds.Contains(e.MemberId)).ToList();
            _db.WeekMembers.RemoveRange(toRemove);

            // Add new members
            var existingMemberIds = existing.Select(e => e.MemberId).ToHashSet();
            foreach (var memberId in request.MemberIds.Where(id => !existingMemberIds.Contains(id)))
            {
                var member = await _db.TeamMembers.FindAsync(new object[] { memberId }, ct);
                if (member == null) continue;
                _db.WeekMembers.Add(new WeekMember(request.WeekId, memberId));
            }

            await _db.SaveChangesAsync(ct);

            var weekMembers = await _db.WeekMembers
                .Include(wm => wm.Member)
                .Include(wm => wm.Tasks).ThenInclude(t => t.BacklogItem)
                .Where(wm => wm.WeekId == request.WeekId)
                .ToListAsync(ct);

            return Result<List<WeekMemberDto>>.Ok(weekMembers.Select(MapToDto).ToList(), "Week members updated");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding week members");
            return Result<List<WeekMemberDto>>.Fail("Failed to add week members");
        }
    }

    private static WeekMemberDto MapToDto(WeekMember wm) => new()
    {
        Id = wm.Id,
        WeekId = wm.WeekId,
        MemberId = wm.MemberId,
        MemberName = wm.Member?.Name ?? "",
        MemberRole = wm.Member?.Role ?? 1,
        TotalPlannedHours = wm.TotalPlannedHours,
        TotalActualHours = wm.TotalActualHours,
        HasSubmitted = wm.HasSubmitted,
        Tasks = wm.Tasks.Select(t => new MemberTaskDto
        {
            Id = t.Id,
            WeekMemberId = t.WeekMemberId,
            BacklogItemId = t.BacklogItemId,
            BacklogTitle = t.BacklogItem?.Title ?? "",
            BacklogCategory = t.BacklogItem?.Category ?? 0,
            EstimatedHours = t.BacklogItem?.EstimatedHours ?? 0,
            PlannedHours = t.PlannedHours,
            ActualHours = t.ActualHours,
            ProgressPercent = t.ProgressPercent
        }).ToList()
    };
}

public class AssignTaskHandler : IRequestHandler<AssignTaskCommand, Result<MemberTaskDto>>
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AssignTaskHandler> _logger;

    public AssignTaskHandler(ApplicationDbContext db, ILogger<AssignTaskHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<MemberTaskDto>> Handle(AssignTaskCommand request, CancellationToken ct)
    {
        try
        {
            var weekMember = await _db.WeekMembers
                .Include(wm => wm.Tasks)
                .Include(wm => wm.Week)
                .FirstOrDefaultAsync(wm => wm.Id == request.WeekMemberId, ct);

            if (weekMember == null) return Result<MemberTaskDto>.Fail("Week member not found");
            if (weekMember.HasSubmitted) return Result<MemberTaskDto>.Fail("Plan already submitted");
            if (weekMember.Week.IsFrozen) return Result<MemberTaskDto>.Fail("Planning week is frozen");

            // Check backlog item exists
            var backlogItem = await _db.BacklogItems.FindAsync(new object[] { request.Request.BacklogItemId }, ct);
            if (backlogItem == null) return Result<MemberTaskDto>.Fail("Backlog item not found");

            // Check category quota
            var week = weekMember.Week;
            var categoryPercent = backlogItem.Category switch
            {
                1 => week.ClientPercent,
                2 => week.TechDebtPercent,
                3 => week.RndPercent,
                _ => 0m
            };
            var maxCategoryHours = 30m * (categoryPercent / 100m);
            var currentCategoryHours = weekMember.Tasks
                .Where(t => t.BacklogItem?.Category == backlogItem.Category || t.BacklogItemId == request.Request.BacklogItemId)
                .Sum(t => t.PlannedHours);

            // Load backlog items for tasks that don't have them loaded
            foreach (var task in weekMember.Tasks.Where(t => t.BacklogItem == null))
            {
                await _db.Entry(task).Reference(t => t.BacklogItem).LoadAsync(ct);
            }
            currentCategoryHours = weekMember.Tasks
                .Where(t => t.BacklogItem?.Category == backlogItem.Category)
                .Sum(t => t.PlannedHours);

            if (currentCategoryHours + request.Request.PlannedHours > maxCategoryHours)
                return Result<MemberTaskDto>.Fail($"Category quota exceeded. Max: {maxCategoryHours}h, Current: {currentCategoryHours}h");

            // Check total won't exceed 30
            var totalPlanned = weekMember.Tasks.Sum(t => t.PlannedHours);
            if (totalPlanned + request.Request.PlannedHours > 30)
                return Result<MemberTaskDto>.Fail($"Total hours would exceed 30. Current: {totalPlanned}h");

            var memberTask = new MemberTask(request.WeekMemberId, request.Request.BacklogItemId, request.Request.PlannedHours);
            _db.MemberTasks.Add(memberTask);

            weekMember.RecalculateHours();
            await _db.SaveChangesAsync(ct);

            // Reload for response
            await _db.Entry(memberTask).Reference(t => t.BacklogItem).LoadAsync(ct);

            return Result<MemberTaskDto>.Ok(new MemberTaskDto
            {
                Id = memberTask.Id,
                WeekMemberId = memberTask.WeekMemberId,
                BacklogItemId = memberTask.BacklogItemId,
                BacklogTitle = backlogItem.Title,
                BacklogCategory = backlogItem.Category,
                EstimatedHours = backlogItem.EstimatedHours,
                PlannedHours = memberTask.PlannedHours,
                ActualHours = memberTask.ActualHours,
                ProgressPercent = memberTask.ProgressPercent
            }, "Task assigned successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning task");
            return Result<MemberTaskDto>.Fail("Failed to assign task");
        }
    }
}

public class RemoveTaskHandler : IRequestHandler<RemoveTaskCommand, Result<bool>>
{
    private readonly ApplicationDbContext _db;

    public RemoveTaskHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<bool>> Handle(RemoveTaskCommand request, CancellationToken ct)
    {
        var task = await _db.MemberTasks
            .Include(t => t.WeekMember).ThenInclude(wm => wm.Week)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, ct);

        if (task == null) return Result<bool>.Fail("Task not found");
        if (task.WeekMember.HasSubmitted) return Result<bool>.Fail("Plan already submitted");
        if (task.WeekMember.Week.IsFrozen) return Result<bool>.Fail("Planning week is frozen");

        _db.MemberTasks.Remove(task);
        task.WeekMember.RecalculateHours();
        await _db.SaveChangesAsync(ct);

        return Result<bool>.Ok(true, "Task removed");
    }
}

public class SubmitMemberPlanHandler : IRequestHandler<SubmitMemberPlanCommand, Result<WeekMemberDto>>
{
    private readonly ApplicationDbContext _db;

    public SubmitMemberPlanHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<WeekMemberDto>> Handle(SubmitMemberPlanCommand request, CancellationToken ct)
    {
        var weekMember = await _db.WeekMembers
            .Include(wm => wm.Member)
            .Include(wm => wm.Tasks).ThenInclude(t => t.BacklogItem)
            .FirstOrDefaultAsync(wm => wm.Id == request.WeekMemberId, ct);

        if (weekMember == null) return Result<WeekMemberDto>.Fail("Week member not found");

        weekMember.RecalculateHours();

        try
        {
            weekMember.Submit();
        }
        catch (InvalidOperationException ex)
        {
            return Result<WeekMemberDto>.Fail(ex.Message);
        }

        await _db.SaveChangesAsync(ct);

        return Result<WeekMemberDto>.Ok(new WeekMemberDto
        {
            Id = weekMember.Id,
            WeekId = weekMember.WeekId,
            MemberId = weekMember.MemberId,
            MemberName = weekMember.Member?.Name ?? "",
            MemberRole = weekMember.Member?.Role ?? 1,
            TotalPlannedHours = weekMember.TotalPlannedHours,
            TotalActualHours = weekMember.TotalActualHours,
            HasSubmitted = weekMember.HasSubmitted,
            Tasks = weekMember.Tasks.Select(t => new MemberTaskDto
            {
                Id = t.Id,
                WeekMemberId = t.WeekMemberId,
                BacklogItemId = t.BacklogItemId,
                BacklogTitle = t.BacklogItem?.Title ?? "",
                BacklogCategory = t.BacklogItem?.Category ?? 0,
                EstimatedHours = t.BacklogItem?.EstimatedHours ?? 0,
                PlannedHours = t.PlannedHours,
                ActualHours = t.ActualHours,
                ProgressPercent = t.ProgressPercent
            }).ToList()
        }, "Plan submitted");
    }
}

public class UpdateTaskProgressHandler : IRequestHandler<UpdateTaskProgressCommand, Result<MemberTaskDto>>
{
    private readonly ApplicationDbContext _db;

    public UpdateTaskProgressHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<MemberTaskDto>> Handle(UpdateTaskProgressCommand request, CancellationToken ct)
    {
        var task = await _db.MemberTasks
            .Include(t => t.BacklogItem)
            .Include(t => t.WeekMember).ThenInclude(wm => wm.Week)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, ct);

        if (task == null) return Result<MemberTaskDto>.Fail("Task not found");

        // Progress can only be updated after freeze
        if (!task.WeekMember.Week.IsFrozen)
            return Result<MemberTaskDto>.Fail("Planning must be frozen before updating progress");

        try
        {
            task.UpdateProgress(request.Request.ActualHours, request.Request.ProgressPercent);
        }
        catch (InvalidOperationException ex)
        {
            return Result<MemberTaskDto>.Fail(ex.Message);
        }

        task.WeekMember.RecalculateHours();
        await _db.SaveChangesAsync(ct);

        return Result<MemberTaskDto>.Ok(new MemberTaskDto
        {
            Id = task.Id,
            WeekMemberId = task.WeekMemberId,
            BacklogItemId = task.BacklogItemId,
            BacklogTitle = task.BacklogItem?.Title ?? "",
            BacklogCategory = task.BacklogItem?.Category ?? 0,
            EstimatedHours = task.BacklogItem?.EstimatedHours ?? 0,
            PlannedHours = task.PlannedHours,
            ActualHours = task.ActualHours,
            ProgressPercent = task.ProgressPercent
        }, "Progress updated");
    }
}

public class GetWeekMembersHandler : IRequestHandler<GetWeekMembersQuery, Result<List<WeekMemberDto>>>
{
    private readonly ApplicationDbContext _db;

    public GetWeekMembersHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<List<WeekMemberDto>>> Handle(GetWeekMembersQuery request, CancellationToken ct)
    {
        var weekMembers = await _db.WeekMembers
            .Include(wm => wm.Member)
            .Include(wm => wm.Tasks).ThenInclude(t => t.BacklogItem)
            .Where(wm => wm.WeekId == request.WeekId)
            .ToListAsync(ct);

        var dtos = weekMembers.Select(wm => new WeekMemberDto
        {
            Id = wm.Id,
            WeekId = wm.WeekId,
            MemberId = wm.MemberId,
            MemberName = wm.Member?.Name ?? "",
            MemberRole = wm.Member?.Role ?? 1,
            TotalPlannedHours = wm.TotalPlannedHours,
            TotalActualHours = wm.TotalActualHours,
            HasSubmitted = wm.HasSubmitted,
            Tasks = wm.Tasks.Select(t => new MemberTaskDto
            {
                Id = t.Id,
                WeekMemberId = t.WeekMemberId,
                BacklogItemId = t.BacklogItemId,
                BacklogTitle = t.BacklogItem?.Title ?? "",
                BacklogCategory = t.BacklogItem?.Category ?? 0,
                EstimatedHours = t.BacklogItem?.EstimatedHours ?? 0,
                PlannedHours = t.PlannedHours,
                ActualHours = t.ActualHours,
                ProgressPercent = t.ProgressPercent
            }).ToList()
        }).ToList();

        return Result<List<WeekMemberDto>>.Ok(dtos);
    }
}

public class GetWeekMemberByIdHandler : IRequestHandler<GetWeekMemberByIdQuery, Result<WeekMemberDto>>
{
    private readonly ApplicationDbContext _db;

    public GetWeekMemberByIdHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<WeekMemberDto>> Handle(GetWeekMemberByIdQuery request, CancellationToken ct)
    {
        var wm = await _db.WeekMembers
            .Include(w => w.Member)
            .Include(w => w.Tasks).ThenInclude(t => t.BacklogItem)
            .FirstOrDefaultAsync(w => w.Id == request.Id, ct);

        if (wm == null) return Result<WeekMemberDto>.Fail("Week member not found");

        return Result<WeekMemberDto>.Ok(new WeekMemberDto
        {
            Id = wm.Id,
            WeekId = wm.WeekId,
            MemberId = wm.MemberId,
            MemberName = wm.Member?.Name ?? "",
            MemberRole = wm.Member?.Role ?? 1,
            TotalPlannedHours = wm.TotalPlannedHours,
            TotalActualHours = wm.TotalActualHours,
            HasSubmitted = wm.HasSubmitted,
            Tasks = wm.Tasks.Select(t => new MemberTaskDto
            {
                Id = t.Id,
                WeekMemberId = t.WeekMemberId,
                BacklogItemId = t.BacklogItemId,
                BacklogTitle = t.BacklogItem?.Title ?? "",
                BacklogCategory = t.BacklogItem?.Category ?? 0,
                EstimatedHours = t.BacklogItem?.EstimatedHours ?? 0,
                PlannedHours = t.PlannedHours,
                ActualHours = t.ActualHours,
                ProgressPercent = t.ProgressPercent
            }).ToList()
        });
    }
}

public class GetDashboardHandler : IRequestHandler<GetDashboardQuery, Result<DashboardDto>>
{
    private readonly ApplicationDbContext _db;

    public GetDashboardHandler(ApplicationDbContext db) { _db = db; }

    public async Task<Result<DashboardDto>> Handle(GetDashboardQuery request, CancellationToken ct)
    {
        var week = await _db.PlanningWeeks.FindAsync(new object[] { request.WeekId }, ct);
        if (week == null) return Result<DashboardDto>.Fail("Planning week not found");

        var weekMembers = await _db.WeekMembers
            .Include(wm => wm.Member)
            .Include(wm => wm.Tasks).ThenInclude(t => t.BacklogItem)
            .Where(wm => wm.WeekId == request.WeekId)
            .ToListAsync(ct);

        var allTasks = weekMembers.SelectMany(wm => wm.Tasks).ToList();
        var totalPlanned = allTasks.Sum(t => t.PlannedHours);
        var totalActual = allTasks.Sum(t => t.ActualHours);
        var avgProgress = allTasks.Any() ? (int)allTasks.Average(t => t.ProgressPercent) : 0;

        return Result<DashboardDto>.Ok(new DashboardDto
        {
            WeekId = week.Id,
            WeekLabel = $"{week.StartDate:MMM d} – {week.EndDate:MMM d}",
            Status = week.Status,
            IsFrozen = week.IsFrozen,
            TotalPlannedHours = totalPlanned,
            TotalActualHours = totalActual,
            CompletionPercent = avgProgress,
            ClientFocused = new CategoryBreakdownDto
            {
                AllocatedPercent = week.ClientPercent,
                PlannedHours = allTasks.Where(t => t.BacklogItem?.Category == 1).Sum(t => t.PlannedHours),
                ActualHours = allTasks.Where(t => t.BacklogItem?.Category == 1).Sum(t => t.ActualHours)
            },
            TechDebt = new CategoryBreakdownDto
            {
                AllocatedPercent = week.TechDebtPercent,
                PlannedHours = allTasks.Where(t => t.BacklogItem?.Category == 2).Sum(t => t.PlannedHours),
                ActualHours = allTasks.Where(t => t.BacklogItem?.Category == 2).Sum(t => t.ActualHours)
            },
            RnD = new CategoryBreakdownDto
            {
                AllocatedPercent = week.RndPercent,
                PlannedHours = allTasks.Where(t => t.BacklogItem?.Category == 3).Sum(t => t.PlannedHours),
                ActualHours = allTasks.Where(t => t.BacklogItem?.Category == 3).Sum(t => t.ActualHours)
            },
            Members = weekMembers.Select(wm => new MemberProgressDto
            {
                WeekMemberId = wm.Id,
                Name = wm.Member?.Name ?? "",
                PlannedHours = wm.TotalPlannedHours,
                ActualHours = wm.TotalActualHours,
                ProgressPercent = wm.Tasks.Any() ? (int)wm.Tasks.Average(t => t.ProgressPercent) : 0,
                HasSubmitted = wm.HasSubmitted
            }).ToList(),
            Tasks = allTasks.Select(t => new TaskProgressDto
            {
                TaskTitle = t.BacklogItem?.Title ?? "",
                MemberName = weekMembers.FirstOrDefault(wm => wm.Id == t.WeekMemberId)?.Member?.Name ?? "",
                PlannedHours = t.PlannedHours,
                ActualHours = t.ActualHours,
                ProgressPercent = t.ProgressPercent
            }).ToList()
        });
    }
}
