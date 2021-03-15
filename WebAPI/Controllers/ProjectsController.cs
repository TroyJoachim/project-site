using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Dto;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetProjectsDto>>> GetProjects()
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
                        Path = image.Path,
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

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GetProjectDto>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Category)
                .Include(p => p.User)
                .Include(p => p.Images)
                .Include(p => p.Files)
                .FirstOrDefaultAsync(p => p.Id == id);

            // Map User to UserDto
            var userDto = new UserDto()
            {
                //Id = project.User.Id,
                IdentityId = project.User.IdentityId, // TODO: check this
                Username = project.User.Username,
                AvatarPath = "TODO"
            };

            // Map Image to ImageDto
            var imageDtoList = new List<ImageDto>();
            foreach (var image in project.Images)
            {
                var imageDto = new ImageDto()
                {
                    FileName = image.FileName,
                    Path = image.Path,
                    Size = image.Size
                };
                imageDtoList.Add(imageDto);
            }

            // Map File to FileDto
            var fileDtoList = new List<FileDto>();
            foreach (var file in project.Files)
            {
                var fileDto = new FileDto()
                {
                    FileName = file.FileName,
                    Path = file.Path,
                    Size = file.Size
                };
                fileDtoList.Add(fileDto);
            }

            // Map Project to GetProjectDto
            var getProjectDto = new GetProjectDto()
            {
                Title = project.Title,
                Description = project.Description,
                Category = project.Category.Name,
                User = userDto,
                Images = imageDtoList,
                Files = fileDtoList
            };

            if (project == null)
            {
                return NotFound();
            }

            return getProjectDto;
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
            var buildSteps = new List<BuildStep>();

            // Map each BuildStepDto to a BuildStep Model
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

            var category = await _context.Categories.FindAsync(project.CategoryId);
            var user = await _context.Users.FindAsync(project.UserId);

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

        private static ICollection<File> MapFiles(ICollection<FileDto> files)
        {
            // Map project files
            var fileList = new List<File>();
            foreach (var file in files)
            {
                var f = new File
                {
                    FileName = file.FileName,
                    Path = file.Path,
                    Size = file.Size
                };

                fileList.Add(f);
            };

            return fileList;
        }

        private static ICollection<Image> MapImages(ICollection<ImageDto> images)
        {
            // Map project images
            var imageList = new List<Image>();
            foreach (var image in images)
            {
                var i = new Image
                {
                    FileName = image.FileName,
                    Path = image.Path,
                    Size = image.Size
                };

                imageList.Add(i);
            };

            return imageList;
        }
    }
}
