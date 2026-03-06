using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.Application.Behaviors;

/// <summary>
/// MediatR pipeline behavior for request validation
/// </summary>
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;
    private readonly ILogger<ValidationBehavior<TRequest, TResponse>> _logger;

    public ValidationBehavior(
        IEnumerable<IValidator<TRequest>> validators,
        ILogger<ValidationBehavior<TRequest, TResponse>> logger)
    {
        _validators = validators;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken))
        );

        var failures = validationResults
            .Where(r => r.Errors.Any())
            .SelectMany(r => r.Errors)
            .ToList();

        if (failures.Any())
        {
            _logger.LogWarning("Validation failed for {RequestType}", typeof(TRequest).Name);
            
            // Create a generic result type to return validation errors
            var resultType = typeof(TResponse);
            if (resultType.IsGenericType && resultType.Name == "Result`1")
            {
                // This is a Result<T> type, we need to return a failed result
                var failMethod = resultType.GetMethod("Fail", 
                    System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static,
                    null, new[] { typeof(List<string>) }, null);
                
                if (failMethod != null)
                {
                    var errorMessages = failures.Select(f => $"{f.PropertyName}: {f.ErrorMessage}").ToList();
                    return (TResponse)failMethod.Invoke(null, new object[] { errorMessages })!;
                }
            }

            throw new ValidationException(failures);
        }

        return await next();
    }
}
