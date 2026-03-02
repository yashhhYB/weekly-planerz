using MediatR;
using Microsoft.Extensions.DependencyInjection;

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

        return services;
    }
}
