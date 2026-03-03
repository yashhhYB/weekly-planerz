using FluentValidation;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Validators;

/// <summary>
/// Validator for CreateBacklogItemRequest
/// </summary>
public class CreateBacklogItemRequestValidator : AbstractValidator<CreateBacklogItemRequest>
{
    public CreateBacklogItemRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

        RuleFor(x => x.Category)
            .InclusiveBetween(1, 3).WithMessage("Category must be 1 (Client), 2 (Tech Debt), or 3 (R&D)");

        RuleFor(x => x.EstimatedHours)
            .GreaterThan(0).WithMessage("Estimated hours must be greater than 0")
            .LessThanOrEqualTo(500).WithMessage("Estimated hours cannot exceed 500 hours");
    }
}

/// <summary>
/// Validator for UpdateBacklogItemRequest
/// </summary>
public class UpdateBacklogItemRequestValidator : AbstractValidator<UpdateBacklogItemRequest>
{
    public UpdateBacklogItemRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

        RuleFor(x => x.EstimatedHours)
            .GreaterThan(0).WithMessage("Estimated hours must be greater than 0")
            .LessThanOrEqualTo(500).WithMessage("Estimated hours cannot exceed 500 hours");
    }
}
