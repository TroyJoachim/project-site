using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WebAPI.Dto;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger _logger;

        public ProjectsController(ApplicationDbContext context, ILogger<ProjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetProjectsDto>>> GetProjects()
        {
            try
            {
                var projectsDto = new List<GetProjectsDto>();

                // Get projects from the database
                var projects = await _context.Projects.Include(p => p.Images).Include(p => p.User).ToListAsync();

                // Map Project to ProjectDto and add it to the list
                foreach (var project in projects)
                {
                    // Map the main image
                    var image = project.Images.FirstOrDefault();
                    ImageDto newImageDto = null;
                    if (image != null)
                    {
                        newImageDto = new ImageDto
                        {
                            FileName = image.FileName,
                            Key = image.Key,
                            Size = image.Size
                        };
                    }

                    // Map the User
                    var userDto = new UserDto()
                    {
                        IdentityId = project.User.IdentityId, // TODO: check if I need to send this
                        Username = project.User.Username
                    };

                    var getProjectDto = new GetProjectsDto
                    {
                        Title = project.Title,
                        Image = newImageDto,
                        User = userDto,
                    };

                    projectsDto.Add(getProjectDto);
                };

                return projectsDto;
            }
            catch (Exception)
            {

                throw;
            }
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GetProjectDto>> GetProject(int id)
        {
            try
            {
                var project = await _context.Projects
                .Include(p => p.Category)
                .Include(p => p.User)
                .Include(p => p.Images)
                .Include(p => p.Files)
                .Include(p => p.BuildSteps)
                .FirstOrDefaultAsync(p => p.Id == id);

                // Map User to UserDto
                var userDto = new UserDto()
                {
                    //Id = project.User.Id,
                    IdentityId = project.User.IdentityId, // TODO: check this
                    Username = project.User.Username,
                    AvatarPath = "TODO"
                };

                var buildStepList = new List<BuildStepDto>();
                foreach (var buildStep in project.BuildSteps)
                {
                    var buildStepDto = new BuildStepDto()
                    {
                        Title = buildStep.Title,
                        Description = buildStep.Description,
                        Images = MapImageDtos(buildStep.Images, project.User.IdentityId),
                        Files = MapFileDtos(buildStep.Files, project.User.IdentityId),
                    };
                }

                // Map Project to GetProjectDto
                var getProjectDto = new GetProjectDto()
                {
                    Title = project.Title,
                    Description = project.Description,
                    Category = project.Category.Name,
                    User = userDto,
                    Images = MapImageDtos(project.Images, project.User.IdentityId),
                    Files = MapFileDtos(project.Files, project.User.IdentityId),
                };

                if (project == null)
                {
                    return NotFound();
                }

                return getProjectDto;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        // PUT: api/Projects/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest();
            }

            _context.Entry(project).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Projects
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ProjectDto>> PostProject(ProjectDto project)
        {
            try
            {
                _logger.LogInformation("api/Projects");
                var category = await _context.Categories.FindAsync(project.CategoryId);
                var user = await _context.Users.FirstOrDefaultAsync(u => u.IdentityId == project.UserId);
                if (user == null)
                {
                    _logger.LogWarning("User was empty");
                    return BadRequest();
                }
                if (category == null)
                {
                    _logger.LogWarning("Category was empty");
                    return BadRequest();
                }

                // Map each BuildStepDto to a BuildStep Model
                var buildSteps = new List<BuildStep>();
                foreach (var buildStep in project.BuildSteps)
                {
                    var newBuildStep = new BuildStep
                    {
                        Title = buildStep.Title,
                        Description = buildStep.Description,
                        Images = MapImages(buildStep.Images),
                        Files = MapFiles(buildStep.Files),
                    };

                    buildSteps.Add(newBuildStep);
                };

                // Map the ProjectDTO to a Project Model
                var newProject = new Project
                {
                    Title = project.Title,
                    Description = project.Description,
                    Category = category,
                    User = user,
                    Images = MapImages(project.Images),
                    Files = MapFiles(project.Files),
                    BuildSteps = buildSteps,
                    CreatedAt = DateTime.UtcNow,
                    EditedAt = DateTime.UtcNow,
                };

                // Add the new Project to the context and save the changes.
                _context.Projects.Add(newProject);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetProject", new { id = newProject.Id }, newProject);
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }

        // Map FileDto to File
        private static List<File> MapFiles(List<FileDto> files)
        {
            // Map project files
            var fileList = new List<File>();
            foreach (var file in files)
            {
                var f = new File
                {
                    FileName = file.FileName,
                    Key = file.Key,
                    Size = file.Size
                };

                fileList.Add(f);
            };

            return fileList;
        }

        // Map ImageDto to Image
        private static List<Image> MapImages(List<ImageDto> images)
        {
            // Map project images
            var imageList = new List<Image>();
            foreach (var image in images)
            {
                var i = new Image
                {
                    FileName = image.FileName,
                    Key = image.Key,
                    Size = image.Size
                };

                imageList.Add(i);
            };

            return imageList;
        }

        // Map File to FileDto
        private static List<FileDto> MapFileDtos(ICollection<File> files, string userId)
        {
            var fileDtoList = new List<FileDto>();
            foreach (var file in files)
            {
                var f = new FileDto
                {
                    FileName = file.FileName,
                    Key = file.Key,
                    Size = file.Size,
                    IdentityId = userId,
                };

                fileDtoList.Add(f);
            }

            return fileDtoList;
        }

        // Map Image to ImageDto
        private static List<ImageDto> MapImageDtos(ICollection<Image> images, string userId)
        {
            // Map project images
            var imageDtoList = new List<ImageDto>();
            foreach (var image in images)
            {
                var i = new ImageDto
                {
                    FileName = image.FileName,
                    Key = image.Key,
                    Size = image.Size,
                    IdentityId = userId,
                };

                imageDtoList.Add(i);
            };

            return imageDtoList;
        }
    }
}
