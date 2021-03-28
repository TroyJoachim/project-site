using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Models;
using WebAPI.Dto;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CollectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger _logger;

        public CollectsController(ApplicationDbContext context, ILogger<LikesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/Collects
        //[Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CollectProject(LikeCollectDto collect)
        {
            try
            {
                var project = await _context.Projects.Include(p => p.UserCollects).SingleOrDefaultAsync(p => p.Id == collect.ProjectId);
                var user = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == collect.IdentityId);

                if (project == null || user == null)
                {
                    return NotFound();
                }

                // Create the many-to-many relationship
                project.UserCollects.Add(user);

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }

        // PUT: api/Collects
        //[Authorize]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UncollectProject(LikeCollectDto collect)
        {
            try
            {
                var project = await _context.Projects.Include(p => p.UserCollects).SingleOrDefaultAsync(p => p.Id == collect.ProjectId);
                var user = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == collect.IdentityId);

                if (project == null || user == null)
                {
                    return NotFound();
                }

                // Remove the many-to-many relationship
                project.UserCollects.Remove(user);

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }
    }
}
