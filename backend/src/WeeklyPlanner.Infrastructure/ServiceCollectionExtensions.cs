using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Infrastructure.Persistence;
using WeeklyPlanner.Infrastructure.Repositories;

namespace WeeklyPlanner.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
            )
        );

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // MediatR - Register handlers from Infrastructure layer
        services.AddMediatR(config =>
            config.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly)
        );

        return services;
    }
}
