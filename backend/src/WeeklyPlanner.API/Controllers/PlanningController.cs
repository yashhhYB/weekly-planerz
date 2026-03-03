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
}
