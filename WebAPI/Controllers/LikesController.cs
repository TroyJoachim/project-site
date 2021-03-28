using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using WebAPI.Models;
using WebAPI.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger _logger;

        public LikesController(ApplicationDbContext context, ILogger<LikesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/Projects
        //[Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> LikeProject(ProjectLikeDto projectLike)
        {
            try
            {
                var project = await _context.Projects.Include(p => p.UserLikes).SingleOrDefaultAsync(p => p.Id == projectLike.ProjectId);
                var user = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == projectLike.IdentityId);

                if (project == null || user == null)
                {
                    return NotFound();
                }

                // Create the many-to-many relationship
                project.UserLikes.Add(user);

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }

        // PUT: api/Projects
        //[Authorize]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UnlikeProject(ProjectLikeDto projectLike)
        {
            try
            {
                var project = await _context.Projects.Include(p => p.UserLikes).SingleOrDefaultAsync(p => p.Id == projectLike.ProjectId);
                var user = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == projectLike.IdentityId);

                if (project == null || user == null)
                {
                    return NotFound();
                }

                // Remove the many-to-many relationship
                project.UserLikes.Remove(user);

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
