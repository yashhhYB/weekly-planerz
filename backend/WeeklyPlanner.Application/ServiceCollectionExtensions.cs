using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using WeeklyPlanner.Application.Behaviors;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Validators;

namespace WeeklyPlanner.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        // MediatR
        services.AddMediatR(config =>
            config.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly)
        );

        // FluentValidation - Register all validators
        services.AddScoped<IValidator<CreatePlanningWeekRequest>, CreatePlanningWeekRequestValidator>();
        services.AddScoped<IValidator<UpdatePlanningWeekRequest>, UpdatePlanningWeekRequestValidator>();
        services.AddScoped<IValidator<CreateBacklogItemRequest>, CreateBacklogItemRequestValidator>();
        services.AddScoped<IValidator<UpdateBacklogItemRequest>, UpdateBacklogItemRequestValidator>();

        // MediatR Pipeline Behaviors
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}
