using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
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
                User user = null;

                // Get the Sub claim from the JWT token
                ClaimsIdentity identity = HttpContext.User.Identity as ClaimsIdentity;
                if (identity != null)
                {
                    var sub = identity.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
                    if (sub != null)
                    {
                        // Find user by Sub. This is a unique id use by AWS Cognito
                        user = await _context.Users.SingleOrDefaultAsync(u => u.Sub == sub.Value);
                    }
                }

                var projectsDto = new List<GetProjectsDto>();

                // Get projects from the database
                var projects = await _context.Projects
                    .Include(p => p.User)
                    .Include(p => p.Category)
                    .Include(p => p.Files)
                    .Include(p => p.UserLikes)
                    .Include(p => p.UserCollects)
                    .OrderBy(p => p.Id)
                    .AsSplitQuery()
                    .ToListAsync();

                // Map Project to ProjectDto and add it to the list
                foreach (var project in projects)
                {
                    // Map the main image
                    var image = project.Files.Where(f => f.IsImage == true).FirstOrDefault();
                    FileDto newFileDto = null;
                    if (image != null)
                    {
                        newFileDto = new FileDto
                        {
                            FileName = image.FileName,
                            Key = image.Key,
                            IdentityId = project.User.IdentityId,
                            Size = image.Size,
                            IsImage = image.IsImage,
                        };
                    }

                    // Map the User
                    var userDto = new BasicUserDto()
                    {
                        IdentityId = project.User.IdentityId, // TODO: check if I need to send this
                        Username = project.User.Username
                    };

                    var getProjectDto = new GetProjectsDto
                    {
                        Id = project.Id,
                        Title = project.Title,
                        Category = project.Category.Name,
                        Liked = user != null && project.UserLikes.Contains(user),
                        Collected = user != null && project.UserCollects.Contains(user),
                        Image = newFileDto,
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
                User user = null;

                // Get the Sub claim from the JWT token
                ClaimsIdentity identity = HttpContext.User.Identity as ClaimsIdentity;
                if (identity != null)
                {
                    var sub = identity.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
                    if (sub != null)
                    {
                        // Find user by Sub. This is a unique id use by AWS Cognito
                        user = await _context.Users.SingleOrDefaultAsync(u => u.Sub == sub.Value);
                    }
                }

                var project = await _context.Projects
                    .Include(p => p.Category)
                    .Include(p => p.User)
                    .Include(p => p.Files)
                    .Include(p => p.UserLikes)
                    .Include(p => p.UserCollects)
                    .Include(p => p.BuildSteps).ThenInclude(bs => bs.Files)
                    .Where(p => p.Id == id)
                    .OrderBy(p => p.Id)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync();

                // Map User to UserDto
                var userDto = new UserDto()
                {
                    //Id = project.User.Id,
                    IdentityId = project.User.IdentityId, // TODO: check this
                    Username = project.User.Username,
                };

                var buildStepList = new List<BuildStepDto>();
                foreach (var buildStep in project.BuildSteps)
                {
                    var buildStepDto = new BuildStepDto()
                    {
                        Id = buildStep.Id,
                        Title = buildStep.Title,
                        Description = buildStep.Description,
                        Order = buildStep.Order,
                        Files = MapFileDtos(buildStep.Files, project.User.IdentityId),
                    };

                    buildStepList.Add(buildStepDto);
                }

                // Map Project to GetProjectDto
                var getProjectDto = new GetProjectDto()
                {
                    Id = project.Id,
                    Title = project.Title,
                    Description = project.Description,
                    Category = project.Category.Name,
                    CategoryId = project.Category.Id,
                    CreatedAt = project.CreatedAt,
                    EditedAt = project.EditedAt,
                    User = userDto,
                    Liked = user != null && project.UserLikes.Contains(user),
                    Collected = user != null && project.UserCollects.Contains(user),
                    Files = MapFileDtos(project.Files, project.User.IdentityId),
                    BuildSteps = buildStepList,
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
        //[Authorize]
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
        //[Authorize]
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
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }

        // DELETE: api/Projects/5
        //[Authorize]
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
                    Size = file.Size,
                    IsImage = file.IsImage,
                };

                fileList.Add(f);
            };

            return fileList;
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
                    IsImage = file.IsImage,
                };

                fileDtoList.Add(f);
            }

            return fileDtoList;
        }
    }
}
