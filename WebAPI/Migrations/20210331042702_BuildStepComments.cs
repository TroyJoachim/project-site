using Microsoft.EntityFrameworkCore.Migrations;

namespace WebAPI.Migrations
{
    public partial class BuildStepComments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BuildStep_Projects_ProjectId",
                table: "BuildStep");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_BuildStep_BuildStepId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_File_BuildStep_BuildStepId",
                table: "File");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BuildStep",
                table: "BuildStep");

            migrationBuilder.RenameTable(
                name: "BuildStep",
                newName: "BuildSteps");

            migrationBuilder.RenameIndex(
                name: "IX_BuildStep_ProjectId",
                table: "BuildSteps",
                newName: "IX_BuildSteps_ProjectId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BuildSteps",
                table: "BuildSteps",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BuildSteps_Projects_ProjectId",
                table: "BuildSteps",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_BuildSteps_BuildStepId",
                table: "Comments",
                column: "BuildStepId",
                principalTable: "BuildSteps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_File_BuildSteps_BuildStepId",
                table: "File",
                column: "BuildStepId",
                principalTable: "BuildSteps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BuildSteps_Projects_ProjectId",
                table: "BuildSteps");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_BuildSteps_BuildStepId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_File_BuildSteps_BuildStepId",
                table: "File");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BuildSteps",
                table: "BuildSteps");

            migrationBuilder.RenameTable(
                name: "BuildSteps",
                newName: "BuildStep");

            migrationBuilder.RenameIndex(
                name: "IX_BuildSteps_ProjectId",
                table: "BuildStep",
                newName: "IX_BuildStep_ProjectId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BuildStep",
                table: "BuildStep",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BuildStep_Projects_ProjectId",
                table: "BuildStep",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_BuildStep_BuildStepId",
                table: "Comments",
                column: "BuildStepId",
                principalTable: "BuildStep",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_File_BuildStep_BuildStepId",
                table: "File",
                column: "BuildStepId",
                principalTable: "BuildStep",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
