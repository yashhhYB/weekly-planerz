using FluentValidation;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Validators;

/// <summary>
/// Validator for CreatePlanningWeekRequest
/// </summary>
public class CreatePlanningWeekRequestValidator : AbstractValidator<CreatePlanningWeekRequest>
{
    public CreatePlanningWeekRequestValidator()
    {
        RuleFor(x => x.PlanningDate)
            .NotEmpty().WithMessage("Planning date is required")
            .Must(BeATuesday).WithMessage("Planning can only be done on Tuesday")
            .GreaterThan(DateTime.UtcNow.AddDays(-1)).WithMessage("Planning date must be in the future");

        RuleFor(x => x.ClientPercent)
            .InclusiveBetween(0, 100).WithMessage("Client percentage must be between 0 and 100");

        RuleFor(x => x.TechDebtPercent)
            .InclusiveBetween(0, 100).WithMessage("Tech debt percentage must be between 0 and 100");

        RuleFor(x => x.RndPercent)
            .InclusiveBetween(0, 100).WithMessage("R&D percentage must be between 0 and 100");

        RuleFor(x => x)
            .Must(HaveValidTotalPercentage)
            .WithMessage("Category percentages must sum to exactly 100%")
            .OverridePropertyName("Percentages");
    }

    private static bool BeATuesday(DateTime date)
    {
        return date.DayOfWeek == DayOfWeek.Tuesday;
    }

    private static bool HaveValidTotalPercentage(CreatePlanningWeekRequest request)
    {
        var total = request.ClientPercent + request.TechDebtPercent + request.RndPercent;
        return Math.Abs(total - 100m) <= 0.01m;
    }
}

/// <summary>
/// Validator for UpdatePlanningWeekRequest
/// </summary>
public class UpdatePlanningWeekRequestValidator : AbstractValidator<UpdatePlanningWeekRequest>
{
    public UpdatePlanningWeekRequestValidator()
    {
        RuleFor(x => x.ClientPercent)
            .InclusiveBetween(0, 100).WithMessage("Client percentage must be between 0 and 100");

        RuleFor(x => x.TechDebtPercent)
            .InclusiveBetween(0, 100).WithMessage("Tech debt percentage must be between 0 and 100");

        RuleFor(x => x.RndPercent)
            .InclusiveBetween(0, 100).WithMessage("R&D percentage must be between 0 and 100");

        RuleFor(x => x)
            .Must(HaveValidTotalPercentage)
            .WithMessage("Category percentages must sum to exactly 100%")
            .OverridePropertyName("Percentages");
    }

    private static bool HaveValidTotalPercentage(UpdatePlanningWeekRequest request)
    {
        var total = request.ClientPercent + request.TechDebtPercent + request.RndPercent;
        return Math.Abs(total - 100m) <= 0.01m;
    }
}
