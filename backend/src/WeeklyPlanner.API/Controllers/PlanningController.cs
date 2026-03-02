using Microsoft.AspNetCore.Mvc;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanningController : ControllerBase
{
    private readonly ILogger<PlanningController> _logger;

    public PlanningController(ILogger<PlanningController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("GetAll planning weeks called");
        return Ok(new { message = "Feature coming soon" });
    }

    [HttpPost]
    public async Task<IActionResult> Create()
    {
        _logger.LogInformation("Create planning week called");
        return Ok(new { message = "Feature coming soon" });
    }
}
