using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebAPI.Models;

namespace WebAPI.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Comment> Comments { get; set; }
    }

    public class Project
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        [Required]
        public DateTime EditedAt { get; set; }
        public ICollection<Image> Images { get; set; }
        public ICollection<File> Files { get; set; }

        public User User { get; set; }
        public Category Category { get; set; }
        public ICollection<BuildStep> BuildSteps { get; set; }
        public ICollection<Comment> Comments { get; set; }
    }

    public class BuildStep
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }

        public Project Project { get; set; }
        public ICollection<Image> Images { get; set; }
        public ICollection<File> Files { get; set; }
        public ICollection<Comment> Comments { get; set; }
    }

    public class Image
    {
        public int Id { get; set; }
        [Required]
        public string FileName { get; set; }
        [Required]
        public string Path { get; set; }
        public int Size { get; set; }

        public BuildStep BuildStep { get; set; }
    }

    public class File
    {
        public int Id { get; set; }
        [Required]
        public string FileName { get; set; }
        [Required]
        public string Path { get; set; }
        public int Size { get; set; }

        public BuildStep BuildStep { get; set; }
    }

    public class Category
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }

        public Category Parent { get; set; }
        public virtual ICollection<Category> Subcategories { get; set; }
        public virtual ICollection<Project> Projects { get; set; }
    }

    public class Comment
    {
        public int Id { get; set; }
        [Required]
        public string Text { get; set; }

        public ICollection<Comment> Comments { get; set; }
    }

    public class Like
    {
        public User User { get; set; }
        public Project Project { get; set; }
    }

    public class Collect
    {
        public User User { get; set; }
        public Project Project { get; set; }
    }

    public class User
    {
        public int Id { get; set; }
        [Required]
        public string IdentityId { get; set; }
        [Required]
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string AvatarImgKey { get; set; }

        public ICollection<Project> Projects { get; set; }
    }
}
