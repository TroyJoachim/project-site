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

    public class ImageDto
    {
        [Required]
        public string FileName { get; set; }
        [Required]
        public string Path { get; set; }
        public int Size { get; set; }
    }

    public class FileDto
    {
        [Required]
        public string FileName { get; set; }
        [Required]
        public string Path { get; set; }
        public int Size { get; set; }
    }

    public class BuildStepDto
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public List<FileDto> Files { get; set; }
        public List<ImageDto> Images { get; set; }
    }

    public class ProjectDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public int UserId { get; set; }
        public List<FileDto> Files { get; set; }
        public List<ImageDto> Images { get; set; }
        public List<BuildStepDto> BuildSteps { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

    }

    public class GetProjectsDto
    {
        public string Title { get; set; }
        public ImageDto Image { get; set; }
        public UserDto User { get; set; }
    }
}
