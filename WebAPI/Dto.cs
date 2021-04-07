using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Dto
{
    public class CategoryDto
    {
        public string Name { get; set; }
        public int? ParentId { get; set; }
    }

    public class FileDto
    {
        [Required]
        public string FileName { get; set; }
        [Required]
        public string Key { get; set; }
        public string IdentityId { get; set; }
        public int Size { get; set; }
        public bool IsImage { get; set; }
    }

    public class BuildStepDto
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public List<FileDto> Files { get; set; }
    }

    public class ProjectDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public string UserId { get; set; }
        [Required]
        public int CategoryId { get; set; }
        public List<FileDto> Files { get; set; }
        public List<BuildStepDto> BuildSteps { get; set; }
    }

    public class BasicUserDto
    {
        public string IdentityId { get; set; }
        public string Username { get; set; }
    }

    public class UserDto
    {
        [Required]
        public string IdentityId { get; set; }
        [Required]
        public string Sub { get; set; }
        [Required]
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

    }

    public class PutUserDto
    {
        [Required]
        public string IdentityId { get; set; }
        public string Username { get; set; }
        public string AvatarImgKey { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

    }

    public class GetProjectsDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public bool Liked { get; set; }
        public bool Collected { get; set; }
        public FileDto Image { get; set; }
        public BasicUserDto User { get; set; }

    }

    public class GetProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int? CategoryId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime EditedAt { get; set; }
        public UserDto User { get; set; }
        public bool Liked { get; set; }
        public bool Collected { get; set; }
        public List<FileDto> Files { get; set; }
        public List<BuildStepDto> BuildSteps { get; set; }
    }

    public class LikeCollectDto
    {
        public int ProjectId { get; set; }
        public string IdentityId { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime EditedAt { get; set; }
        public BasicUserDto User { get; set; }
        public int? ParentId { get; set; }
        public int ProjectId { get; set; }
        public int ChildCount { get; set; }
    }

    public class ChildCommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime EditedAt { get; set; }
        public BasicUserDto User { get; set; }
        public BasicUserDto InReplyTo { get; set; }
        public int ParentId { get; set; }
    }

    public class PutCommentDto
    {
        public string Text { get; set; }
    }

    public class PostCommentDto
    {
        [Required]
        public string Text { get; set; }
        [Required]
        public string IdentityId { get; set; }
        public int? InReplyTo { get; set; }
        public int? ProjectId { get; set; }
        public int? BuildStepId { get; set; }
    }

    public class PostChildCommentDto
    {
        public int ParentId { get; set; }
        [Required]
        public string Text { get; set; }
        [Required]
        public string IdentityId { get; set; }
        public string InReplyTo { get; set; }
    }
}
