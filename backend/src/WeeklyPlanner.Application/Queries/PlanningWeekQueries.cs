using MediatR;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Queries;

/// <summary>
/// Query to retrieve all planning weeks
/// </summary>
public class GetAllPlanningWeeksQuery : IRequest<Result<List<PlanningWeekDto>>>
{
}

/// <summary>
/// Query to retrieve a specific planning week by ID
/// </summary>
public class GetPlanningWeekByIdQuery : IRequest<Result<PlanningWeekDto>>
{
    public Guid Id { get; set; }

    public GetPlanningWeekByIdQuery(Guid id)
    {
        Id = id;
    }
}

/// <summary>
/// Generic result wrapper for API responses
/// </summary>
public class Result<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();

    public static Result<T> Ok(T data, string message = "Success")
    {
        return new Result<T> { Success = true, Data = data, Message = message };
    }

    public static Result<T> Fail(string message)
    {
        return new Result<T> { Success = false, Message = message };
    }

    public static Result<T> Fail(List<string> errors)
    {
        return new Result<T> { Success = false, Errors = errors };
    }
}
