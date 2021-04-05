using Microsoft.EntityFrameworkCore.Migrations;

namespace WebAPI.Migrations
{
    public partial class ChildCommentProp : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChildComment_Comments_CommentId",
                table: "ChildComment");

            migrationBuilder.DropForeignKey(
                name: "FK_ChildComment_Users_InReplyToId",
                table: "ChildComment");

            migrationBuilder.DropForeignKey(
                name: "FK_ChildComment_Users_UserId",
                table: "ChildComment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChildComment",
                table: "ChildComment");

            migrationBuilder.RenameTable(
                name: "ChildComment",
                newName: "ChildComments");

            migrationBuilder.RenameIndex(
                name: "IX_ChildComment_UserId",
                table: "ChildComments",
                newName: "IX_ChildComments_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_ChildComment_InReplyToId",
                table: "ChildComments",
                newName: "IX_ChildComments_InReplyToId");

            migrationBuilder.RenameIndex(
                name: "IX_ChildComment_CommentId",
                table: "ChildComments",
                newName: "IX_ChildComments_CommentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChildComments",
                table: "ChildComments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChildComments_Comments_CommentId",
                table: "ChildComments",
                column: "CommentId",
                principalTable: "Comments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChildComments_Users_InReplyToId",
                table: "ChildComments",
                column: "InReplyToId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChildComments_Users_UserId",
                table: "ChildComments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChildComments_Comments_CommentId",
                table: "ChildComments");

            migrationBuilder.DropForeignKey(
                name: "FK_ChildComments_Users_InReplyToId",
                table: "ChildComments");

            migrationBuilder.DropForeignKey(
                name: "FK_ChildComments_Users_UserId",
                table: "ChildComments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChildComments",
                table: "ChildComments");

            migrationBuilder.RenameTable(
                name: "ChildComments",
                newName: "ChildComment");

            migrationBuilder.RenameIndex(
                name: "IX_ChildComments_UserId",
                table: "ChildComment",
                newName: "IX_ChildComment_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_ChildComments_InReplyToId",
                table: "ChildComment",
                newName: "IX_ChildComment_InReplyToId");

            migrationBuilder.RenameIndex(
                name: "IX_ChildComments_CommentId",
                table: "ChildComment",
                newName: "IX_ChildComment_CommentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChildComment",
                table: "ChildComment",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChildComment_Comments_CommentId",
                table: "ChildComment",
                column: "CommentId",
                principalTable: "Comments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChildComment_Users_InReplyToId",
                table: "ChildComment",
                column: "InReplyToId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChildComment_Users_UserId",
                table: "ChildComment",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
