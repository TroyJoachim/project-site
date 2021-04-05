using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace WebAPI.Migrations
{
    public partial class AddChildComment : Migration
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
                name: "FK_Comments_Comments_CommentId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Projects_ProjectId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_File_BuildStep_BuildStepId",
                table: "File");

            migrationBuilder.DropIndex(
                name: "IX_Comments_CommentId",
                table: "Comments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BuildStep",
                table: "BuildStep");

            migrationBuilder.DropColumn(
                name: "CommentId",
                table: "Comments");

            migrationBuilder.RenameTable(
                name: "BuildStep",
                newName: "BuildSteps");

            migrationBuilder.RenameIndex(
                name: "IX_BuildStep_ProjectId",
                table: "BuildSteps",
                newName: "IX_BuildSteps_ProjectId");

            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "Comments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_BuildSteps",
                table: "BuildSteps",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ChildComment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Text = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    InReplyToId = table.Column<int>(type: "integer", nullable: true),
                    CommentId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChildComment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChildComment_Comments_CommentId",
                        column: x => x.CommentId,
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChildComment_Users_InReplyToId",
                        column: x => x.InReplyToId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChildComment_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChildComment_CommentId",
                table: "ChildComment",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_ChildComment_InReplyToId",
                table: "ChildComment",
                column: "InReplyToId");

            migrationBuilder.CreateIndex(
                name: "IX_ChildComment_UserId",
                table: "ChildComment",
                column: "UserId");

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
                name: "FK_Comments_Projects_ProjectId",
                table: "Comments",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_Comments_Projects_ProjectId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_File_BuildSteps_BuildStepId",
                table: "File");

            migrationBuilder.DropTable(
                name: "ChildComment");

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

            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "Comments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "CommentId",
                table: "Comments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_BuildStep",
                table: "BuildStep",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CommentId",
                table: "Comments",
                column: "CommentId");

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
                name: "FK_Comments_Comments_CommentId",
                table: "Comments",
                column: "CommentId",
                principalTable: "Comments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Projects_ProjectId",
                table: "Comments",
                column: "ProjectId",
                principalTable: "Projects",
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
