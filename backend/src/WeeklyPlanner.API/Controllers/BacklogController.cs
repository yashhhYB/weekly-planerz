using MediatR;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Commands;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BacklogController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<BacklogController> _logger;

    public BacklogController(IMediator mediator, ILogger<BacklogController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all backlog items
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<List<BacklogItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetAll backlog items called");
        var result = await _mediator.Send(new GetAllBacklogItemsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get active (non-archived) backlog items
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(Result<List<BacklogItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetActive backlog items called");
        var result = await _mediator.Send(new GetActiveBacklogItemsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific backlog item by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Result<BacklogItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetById backlog item {Id} called", id);
        var result = await _mediator.Send(new GetBacklogItemByIdQuery(id), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Create a new backlog item
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Result<BacklogItemDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateBacklogItemRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Create backlog item called: {Title}", request.Title);
        var result = await _mediator.Send(new CreateBacklogItemCommand(request), cancellationToken);
        
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Update a backlog item
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(Result<BacklogItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBacklogItemRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Update backlog item {Id} called", id);
        var result = await _mediator.Send(new UpdateBacklogItemCommand(id, request), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Archive a backlog item
    /// </summary>
    [HttpPost("{id:guid}/archive")]
    [ProducesResponseType(typeof(Result<BacklogItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Archive backlog item {Id} called", id);
        var result = await _mediator.Send(new ArchiveBacklogItemCommand(id), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Delete a backlog item
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Delete backlog item {Id} called", id);
        var result = await _mediator.Send(new DeleteBacklogItemCommand(id), cancellationToken);
        
        if (!result.Success)
            return NotFound(result);

        return NoContent();
    }
}
