using MediatR;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Commands;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Application.Queries;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TeamController> _logger;

    public TeamController(IMediator mediator, ILogger<TeamController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllTeamMembersQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTeamMemberByIdQuery(id), ct);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamMemberRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateTeamMemberCommand(request), ct);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTeamMemberRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateTeamMemberCommand(id, request), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteTeamMemberCommand(id), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id:guid}/role")]
    public async Task<IActionResult> SetLead(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new SetTeamLeadCommand(id), ct);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
