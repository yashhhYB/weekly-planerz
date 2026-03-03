using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WeeklyPlanner.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BacklogItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    EstimatedHours = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BacklogItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanningWeeks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanningDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsFrozen = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ClientPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    TechDebtPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    RndPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningWeeks", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BacklogItems_Category",
                table: "BacklogItems",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_BacklogItems_IsArchived",
                table: "BacklogItems",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningWeeks_PlanningDate",
                table: "PlanningWeeks",
                column: "PlanningDate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlanningWeeks_StartDate_EndDate",
                table: "PlanningWeeks",
                columns: new[] { "StartDate", "EndDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BacklogItems");

            migrationBuilder.DropTable(
                name: "PlanningWeeks");
        }
    }
}
