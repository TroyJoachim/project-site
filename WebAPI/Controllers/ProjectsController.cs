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
            projects.ForEach((p) =>
            {
                // Map the main image
                var image = p.Images.FirstOrDefault();
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
                    Id = p.User.Id,
                    Username = p.User.Username
                };

                var newProjectDto = new GetProjectsDto
                {
                    Title = p.Title,
                    Image = newImageDto,
                    User = userDto
                };

                projectsDto.Add(newProjectDto);
            });

            return projectsDto;
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
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
            project.BuildSteps.ForEach((bs) =>
            {
                var newBuildStep = new BuildStep
                {
                    Title = bs.Title,
                    Description = bs.Description,
                    Images = MapImages(bs.Images),
                    Files = MapFiles(bs.Files),
                };

                buildSteps.Add(newBuildStep);
            });

            var user = await _context.Users.FindAsync(project.UserId);

            // Map the ProjectDTO to a Project Model
            var newProject = new Project
            {
                Title = project.Title,
                Description = project.Description,
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

        private static List<File> MapFiles(List<FileDto> files)
        {
            // Map project files
            var fileList = new List<File>();
            files.ForEach((f) =>
            {
                var file = new File
                {
                    FileName = f.FileName,
                    Path = f.Path,
                    Size = f.Size
                };

                fileList.Add(file);
            });

            return fileList;
        }

        private static List<Image> MapImages(List<ImageDto> images)
        {
            // Map project images
            var imageList = new List<Image>();
            images.ForEach((pi) =>
            {
                var image = new Image
                {
                    FileName = pi.FileName,
                    Path = pi.Path,
                    Size = pi.Size
                };

                imageList.Add(image);
            });

            return imageList;
        }
    }
}
