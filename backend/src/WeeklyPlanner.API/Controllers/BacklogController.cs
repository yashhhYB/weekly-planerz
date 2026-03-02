using Microsoft.AspNetCore.Mvc;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BacklogController : ControllerBase
{
    private readonly ILogger<BacklogController> _logger;

    public BacklogController(ILogger<BacklogController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("GetAll backlog items called");
        return Ok(new { message = "Feature coming soon" });
    }

    [HttpPost]
    public async Task<IActionResult> Create()
    {
        _logger.LogInformation("Create backlog item called");
        return Ok(new { message = "Feature coming soon" });
    }
}
