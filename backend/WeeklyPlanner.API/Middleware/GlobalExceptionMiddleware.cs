using System.Net;
using System.Text.Json;
using FluentValidation;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponse<object>();

        switch (exception)
        {
            case ValidationException validationEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = validationEx.Errors
                        .GroupBy(x => x.PropertyName)
                        .Select(g => $"{g.Key}: {string.Join(", ", g.Select(x => x.ErrorMessage))}")
                        .ToList()
                };
                break;

            case KeyNotFoundException knfEx:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = new ApiResponse<object>
                {
                    Success = false,
                    Message = "Resource not found",
                    Errors = new() { knfEx.Message }
                };
                break;

            case InvalidOperationException ioEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new ApiResponse<object>
                {
                    Success = false,
                    Message = "Operation invalid",
                    Errors = new() { ioEx.Message }
                };
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new ApiResponse<object>
                {
                    Success = false,
                    Message = "An unexpected error occurred",
                    Errors = new() { "Internal server error" }
                };
                break;
        }

        return context.Response.WriteAsJsonAsync(response);
    }
}
