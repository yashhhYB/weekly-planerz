using MediatR;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Commands;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanningController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PlanningController> _logger;

    public PlanningController(IMediator mediator, ILogger<PlanningController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all planning weeks
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<List<PlanningWeekDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetAll planning weeks called");
        var result = await _mediator.Send(new GetAllPlanningWeeksQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific planning week by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Result<PlanningWeekDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetById planning week {Id} called", id);
        var result = await _mediator.Send(new GetPlanningWeekByIdQuery(id), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Create a new planning week
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Result<PlanningWeekDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePlanningWeekRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Create planning week called for date {Date}", request.PlanningDate);
        var result = await _mediator.Send(new CreatePlanningWeekCommand(request), cancellationToken);
        
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Update a planning week
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(Result<PlanningWeekDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePlanningWeekRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Update planning week {Id} called", id);
        var result = await _mediator.Send(new UpdatePlanningWeekCommand(id, request), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Freeze a planning week
    /// </summary>
    [HttpPost("{id:guid}/freeze")]
    [ProducesResponseType(typeof(Result<PlanningWeekDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Freeze(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Freeze planning week {Id} called", id);
        var result = await _mediator.Send(new FreezePlanningWeekCommand(id), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Start a planning week (Setup -> InProgress)
    /// </summary>
    [HttpPost("{id:guid}/start")]
    [ProducesResponseType(typeof(Result<PlanningWeekDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Start planning week {Id} called", id);
        var result = await _mediator.Send(new StartPlanningWeekCommand(id), cancellationToken);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Complete a planning week (InProgress -> Completed)
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(Result<PlanningWeekDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Complete planning week {Id} called", id);
        var result = await _mediator.Send(new CompletePlanningWeekCommand(id), cancellationToken);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Archive a planning week (Completed -> Archived)
    /// </summary>
    [HttpPost("{id:guid}/archive")]
    [ProducesResponseType(typeof(Result<PlanningWeekDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Archive planning week {Id} called", id);
        var result = await _mediator.Send(new ArchivePlanningWeekCommand(id), cancellationToken);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Delete a planning week
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Delete planning week {Id} called", id);
        var result = await _mediator.Send(new DeletePlanningWeekCommand(id), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return NoContent();
    }

    // ──────────── Week Members ────────────

    /// <summary>
    /// Add/update members assigned to a planning week
    /// </summary>
    [HttpPost("{id:guid}/members")]
    public async Task<IActionResult> AddMembers(Guid id, [FromBody] List<Guid> memberIds, CancellationToken ct)
    {
        var result = await _mediator.Send(new AddWeekMembersCommand(id, memberIds), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Get all members assigned to a planning week
    /// </summary>
    [HttpGet("{id:guid}/members")]
    public async Task<IActionResult> GetMembers(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetWeekMembersQuery(id), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific week member with their tasks
    /// </summary>
    [HttpGet("members/{weekMemberId:guid}")]
    public async Task<IActionResult> GetWeekMember(Guid weekMemberId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetWeekMemberByIdQuery(weekMemberId), ct);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>
    /// Assign a backlog task to a week member
    /// </summary>
    [HttpPost("members/{weekMemberId:guid}/tasks")]
    public async Task<IActionResult> AssignTask(Guid weekMemberId, [FromBody] AssignTaskRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new AssignTaskCommand(weekMemberId, request), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Remove an assigned task
    /// </summary>
    [HttpDelete("tasks/{taskId:guid}")]
    public async Task<IActionResult> RemoveTask(Guid taskId, CancellationToken ct)
    {
        var result = await _mediator.Send(new RemoveTaskCommand(taskId), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Submit a member's plan (must total 30 hours)
    /// </summary>
    [HttpPost("members/{weekMemberId:guid}/submit")]
    public async Task<IActionResult> SubmitPlan(Guid weekMemberId, CancellationToken ct)
    {
        var result = await _mediator.Send(new SubmitMemberPlanCommand(weekMemberId), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Unsubmit a member's plan (toggle back to editable)
    /// </summary>
    [HttpPost("members/{weekMemberId:guid}/unsubmit")]
    public async Task<IActionResult> UnsubmitPlan(Guid weekMemberId, CancellationToken ct)
    {
        var result = await _mediator.Send(new UnsubmitMemberPlanCommand(weekMemberId), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Update task progress (actual hours + progress %)
    /// </summary>
    [HttpPut("tasks/{taskId:guid}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid taskId, [FromBody] UpdateProgressRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateTaskProgressCommand(taskId, request), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Get dashboard data for a planning week
    /// </summary>
    [HttpGet("{id:guid}/dashboard")]
    public async Task<IActionResult> GetDashboard(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDashboardQuery(id), ct);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }
}
