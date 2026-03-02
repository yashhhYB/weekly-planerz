using WeeklyPlanner.Infrastructure;
using WeeklyPlanner.Application;
using WeeklyPlanner.API.Middleware;

// Build version: Production deployment - Ready for Azure
var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Services.AddLogging(logging =>
    logging.AddConsole()
);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger (Development only)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen();
}

// Register application services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWeb", policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global exception middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AllowWeb");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}).WithName("Health");

await app.RunAsync();
