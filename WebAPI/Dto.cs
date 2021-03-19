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
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
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

    public class UserDto
    {
        [Required]
        public string IdentityId { get; set; }
        [Required]
        public string Username { get; set; }
        public string AvatarPath { get; set; }
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
        public string Title { get; set; }
        public FileDto Image { get; set; }
        public UserDto User { get; set; }
    }

    public class GetProjectDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int? CategoryId { get; set; }
        public UserDto User { get; set; }
        public List<FileDto> Files { get; set; }
        public List<BuildStepDto> BuildSteps { get; set; }
    }
}
