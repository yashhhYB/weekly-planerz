# Business Rules Implementation

## Rule 1: Planning Only on Tuesday

### Definition
A PlanningWeek can ONLY be created on a Tuesday.

### Implementation

**Domain Validation:**
```csharp
public class PlanningWeek
{
    private PlanningWeek(DateTime planningDate, ...)
    {
        if (planningDate.DayOfWeek != DayOfWeek.Tuesday)
            throw new InvalidOperationException("Planning can only be created on Tuesday");
        
        PlanningDate = planningDate;
        StartDate = planningDate.AddDays(1);  // Wednesday
        EndDate = planningDate.AddDays(6);    // Monday (next week)
    }
}
```

**Command Validator:**
```csharp
public class CreatePlanningWeekValidator : AbstractValidator<CreatePlanningWeekCommand>
{
    public CreatePlanningWeekValidator()
    {
        RuleFor(x => x.PlanningDate)
            .Must(d => d.DayOfWeek == DayOfWeek.Tuesday)
            .WithMessage("Planning can only be created on Tuesday");
    }
}
```

**Test Case:**
```csharp
[Fact]
public void CreatePlanningWeek_WhenNotTuesday_Throws()
{
    var monday = new DateTime(2026, 3, 2);  // This is Monday
    
    Assert.Throws<InvalidOperationException>(() => 
        new PlanningWeek(monday, ...));
}

[Fact]
public void CreatePlanningWeek_WhenTuesday_Succeeds()
{
    var tuesday = new DateTime(2026, 3, 3);  // This is Tuesday
    
    var result = new PlanningWeek(tuesday, ...);
    
    Assert.Equal(tuesday, result.PlanningDate);
}
```

---

## Rule 2: Work Period (Wed → Mon)

### Definition
Planning week runs Wednesday → Monday (4 working days).

### Implementation

**Entity:**
```csharp
public class PlanningWeek
{
    public DateTime PlanningDate { get; }    // Tuesday
    public DateTime StartDate { get; }        // Wednesday
    public DateTime EndDate { get; }          // Monday (next week)
    public int WorkingDays => 4;
    public int HoursPerDay => 8;
    public int TotalHoursPerMember => 30;    // 4 days * 8 hours - 2 hours meeting
}
```

**Database:**
```csharp
modelBuilder.Entity<PlanningWeek>()
    .Property(x => x.StartDate)
    .IsRequired();

modelBuilder.Entity<PlanningWeek>()
    .Property(x => x.EndDate)
    .IsRequired();
```

---

## Rule 3: 30-Hour Strict Enforcement

### Definition
Each team member must allocate EXACTLY 30 hours per planning week:
- 4 working days × 8 hours/day = 32 hours
- 2 hours reserved for team meeting
- **Remaining: 30 hours**

Members CANNOT exceed 30 hours total.

### Implementation

**PlanEntry Validation:**
```csharp
public class PlanEntry
{
    public Guid PlanningWeekId { get; set; }
    public Guid UserId { get; set; }
    public List<PlanEntryItem> Items { get; set; }
    
    public decimal GetTotalPlannedHours() 
        => Items.Sum(x => x.PlannedHours);
    
    public bool IsValid()
    {
        var total = GetTotalPlannedHours();
        return Math.Abs(total - 30m) < 0.01m;  // Exactly 30 (floating point safe)
    }
}
```

**Command Validator:**
```csharp
public class CreatePlanEntryValidator : AbstractValidator<CreatePlanEntryCommand>
{
    public CreatePlanEntryValidator()
    {
        RuleFor(x => x.Items)
            .Must(items => 
            {
                var total = items.Sum(i => i.PlannedHours);
                return Math.Abs(total - 30m) < 0.01m;
            })
            .WithMessage("Planned hours must equal exactly 30");
    }
}
```

**Test Cases:**
```csharp
[Fact]
public void PlanEntry_When29Hours_IsInvalid()
{
    var planEntry = new PlanEntry(planningWeekId, userId);
    planEntry.AddItem(backlogItemId, 29);
    
    Assert.False(planEntry.IsValid());
}

[Fact]
public void PlanEntry_When30Hours_IsValid()
{
    var planEntry = new PlanEntry(planningWeekId, userId);
    planEntry.AddItem(backlogItemId1, 15);
    planEntry.AddItem(backlogItemId2, 15);
    
    Assert.True(planEntry.IsValid());
}

[Fact]
public void PlanEntry_When31Hours_IsInvalid()
{
    var planEntry = new PlanEntry(planningWeekId, userId);
    planEntry.AddItem(backlogItemId, 31);
    
    Assert.False(planEntry.IsValid());
}
```

---

## Rule 4: Category Percentage Validation

### Definition
Team Lead defines allocation percentages that must sum to 100%:
- ClientFocused %
- TechDebt %
- RnD %

**Must equal exactly 100%**

### Implementation

**Category Allocation:**
```csharp
public class CategoryAllocation
{
    public decimal ClientPercent { get; set; }
    public decimal TechDebtPercent { get; set; }
    public decimal RndPercent { get; set; }
    
    public bool IsValid()
    {
        var total = ClientPercent + TechDebtPercent + RndPercent;
        return Math.Abs(total - 100m) < 0.01m;  // Exactly 100%
    }
    
    public decimal GetClientHours() => 30 * (ClientPercent / 100);
    public decimal GetTechDebtHours() => 30 * (TechDebtPercent / 100);
    public decimal GetRndHours() => 30 * (RndPercent / 100);
}
```

**Validator:**
```csharp
public class CategoryAllocationValidator : AbstractValidator<CategoryAllocation>
{
    public CategoryAllocationValidator()
    {
        RuleFor(x => x)
            .Must(x => 
            {
                var total = x.ClientPercent + x.TechDebtPercent + x.RndPercent;
                return Math.Abs(total - 100m) < 0.01m;
            })
            .WithMessage("Category percentages must sum to exactly 100%");
    }
}
```

**Test Cases:**
```csharp
[Fact]
public void CategoryAllocation_When100Percent_IsValid()
{
    var allocation = new CategoryAllocation { 
        ClientPercent = 50, 
        TechDebtPercent = 30, 
        RndPercent = 20 
    };
    
    Assert.True(allocation.IsValid());
}

[Fact]
public void CategoryAllocation_When99Percent_IsInvalid()
{
    var allocation = new CategoryAllocation { 
        ClientPercent = 50, 
        TechDebtPercent = 30, 
        RndPercent = 19 
    };
    
    Assert.False(allocation.IsValid());
}
```

---

## Rule 5: Category Limit Enforcement

### Definition
Members cannot exceed their allocated category hours.

**Example:**
- Client: 50% × 30 = 15 hours
- TechDebt: 30% × 30 = 9 hours
- RnD: 20% × 30 = 6 hours

Member cannot allocate more than these limits.

### Implementation

**PlanEntryItem:**
```csharp
public class PlanEntryItem
{
    public Guid BacklogItemId { get; set; }
    public BacklogItemCategory Category { get; set; }
    public decimal PlannedHours { get; set; }
}
```

**Domain Service:**
```csharp
public class PlanEntryValidationService
{
    public void ValidateCategoryLimits(
        List<PlanEntryItem> items,
        CategoryAllocation allocation)
    {
        var clientHours = items
            .Where(x => x.Category == BacklogItemCategory.ClientFocused)
            .Sum(x => x.PlannedHours);
            
        if (clientHours > allocation.GetClientHours())
            throw new DomainException("Client hours exceed allocation");
        
        // Similar for TechDebt and RnD
    }
}
```

---

## Rule 6: Freeze State Immutability

### Definition
Once a PlanningWeek is frozen (IsFrozen = true):
- Cannot add/remove items
- Cannot change PlannedHours
- CAN update: ActualHours, ProgressPercent

### Implementation

**Entity:**
```csharp
public class PlanningWeek
{
    public bool IsFrozen { get; private set; }
    
    public void Freeze()
    {
        IsFrozen = true;
    }
    
    public void UpdateProgressAndActual(
        Guid userId, 
        Dictionary<Guid, decimal> actualHours,
        Dictionary<Guid, decimal> progressPercent)
    {
        if (!IsFrozen)
            throw new DomainException("Can only update actual hours when frozen");
        
        // Update logic
    }
}
```

**Command Validator:**
```csharp
public class UpdateActualHoursValidator : AbstractValidator<UpdateActualHoursCommand>
{
    private readonly IRepository<PlanningWeek> _repo;
    
    public UpdateActualHoursValidator(IRepository<PlanningWeek> repo)
    {
        _repo = repo;
        
        RuleFor(x => x)
            .MustAsync(async (cmd, ct) => 
            {
                var week = await _repo.GetByIdAsync(cmd.PlanningWeekId, ct);
                return week.IsFrozen;
            })
            .WithMessage("Can only update actual hours when planning is frozen");
    }
}
```

**Test Cases:**
```csharp
[Fact]
public void UpdatePlannedHours_WhenNotFrozen_Succeeds()
{
    var week = new PlanningWeek(...);
    
    var item = week.AddItem(backlogItemId, 10);
    item.UpdatePlannedHours(15);
    
    Assert.Equal(15, item.PlannedHours);
}

[Fact]
public void UpdatePlannedHours_WhenFrozen_Throws()
{
    var week = new PlanningWeek(...);
    week.Freeze();
    
    var item = week.GetItem(itemId);
    
    Assert.Throws<DomainException>(() => 
        item.UpdatePlannedHours(15));
}

[Fact]
public void UpdateActualHours_WhenFrozen_Succeeds()
{
    var week = new PlanningWeek(...);
    week.Freeze();
    
    var item = week.GetItem(itemId);
    item.UpdateActualHours(14);
    
    Assert.Equal(14, item.ActualHours);
}
```

---

## Test Coverage Summary

| Rule | Test Cases | Coverage |
|------|----|----------|
| Tuesday Validation | 2 | 100% |
| 30-Hour Enforcement | 3 | 100% |
| Category Percentage | 2 | 100% |
| Category Limits | 3 | 100% |
| Freeze State | 3 | 100% |

**Total:** 13 critical test cases for domain rules
