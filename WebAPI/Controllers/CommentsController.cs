using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using WebAPI.Dto;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger _logger;

        public CommentsController(ApplicationDbContext context, ILogger<ProjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetComment()
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Include(c => c.Comments)
                .OrderBy(c => c.Id)
                .AsSplitQuery()
                .ToListAsync();

            return MapCommentDtos(comments);
        }

        // GET: api/Comments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CommentDto>> GetComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);

            if (comment == null)
            {
                return NotFound();
            }

            var basicUserDto = new BasicUserDto()
            {
                IdentityId = comment.User.IdentityId,
                Username = comment.User.Username,
            };

            var commentDto = new CommentDto()
            {
                Id = comment.Id,
                Text = comment.Text,
                EditedAt = comment.EditedAt,
                User = basicUserDto,
                Children = null,
            };

            return commentDto;
        }

        // GET: api/Comments/ProjectComments/5
        [HttpGet("ProjectComments/{projectId}")]
        public async Task<ActionResult<List<CommentDto>>> GetProjectComments(int projectId)
        {
            try
            {
                var comments = await _context.Comments
                    .Include(c => c.User)
                    .Include(c => c.Comments)
                    .Where(c => c.Project.Id == projectId)
                    .OrderBy(c => c.Id)
                    .AsSplitQuery()
                    .ToListAsync();

                var newCommentList = new List<CommentDto>();
                foreach (var comment in comments)
                {
                    var basicUserDto = new BasicUserDto()
                    {
                        IdentityId = comment.User.IdentityId,
                        Username = comment.User.Username,
                    };

                    var commentDto = new CommentDto()
                    {
                        Id = comment.Id,
                        Text = comment.Text,
                        EditedAt = comment.EditedAt,
                        User = basicUserDto,
                        Children = comment.Comments != null ? MapCommentDtos(comment.Comments) : null
                    };

                    newCommentList.Add(commentDto);
                }

                return newCommentList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }

        // PUT: api/Comments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutComment(int id, PutCommentDto newComment)
        {
            try
            {
                if (id != newComment.Id)
                {
                    return BadRequest();
                }

                // Get the comment and update the text and EditedAt properties
                var comment = await _context.Comments.FindAsync(newComment.Id);
                comment.Text = newComment.Text;
                comment.EditedAt = DateTime.UtcNow;

                _context.Entry(comment).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentExists(id))
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

        // POST: api/Comments
        //[Authorize]
        [HttpPost]
        public async Task<ActionResult<CommentDto>> PostComment(PostCommentDto postComment)
        {
            try
            {
                Comment parentComment = null;
                Project project = null;
                BuildStep buildStep = null;
                var user = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == postComment.IdentityId);
                if (postComment.InReplyTo != null)
                {
                    parentComment = await _context.Comments.FindAsync(postComment.InReplyTo);
                }
                if (postComment.ProjectId != null)
                {
                    project = await _context.Projects.FindAsync(postComment.ProjectId);
                }
                if (postComment.BuildStepId != null)
                {
                    buildStep = await _context.BuildSteps.FindAsync(postComment.BuildStepId);
                }
                
                var newComment = new Comment()
                {
                    Text = postComment.Text,
                    CreatedAt = DateTime.UtcNow,
                    EditedAt = DateTime.UtcNow,
                    ParentComment = parentComment,
                    User = user,
                    Project = project,
                    BuildStep = buildStep,
                };

                _context.Comments.Add(newComment);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetComment", new { id = newComment.Id }, MapCommentToDto(newComment));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }

        // DELETE: api/Comments/5
        //[Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                return NotFound();
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CommentExists(int id)
        {
            return _context.Comments.Any(e => e.Id == id);
        }

        private static CommentDto MapCommentToDto(Comment comment)
        {
            // Map the User
            var userDto = new BasicUserDto()
            {
                IdentityId = comment.User.IdentityId, // TODO: check if I need to send this
                Username = comment.User.Username
            };

            var newCommentDto = new CommentDto()
            {
                Id = comment.Id,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                EditedAt = comment.EditedAt,
                User = userDto,
                //Comments = MapCommentDtos(comment.Comments),
            };
            return newCommentDto;
        }

        private static List<CommentDto> MapCommentDtos(ICollection<Comment> comments)
        {
            var newCommentList = new List<CommentDto>();
            foreach (var comment in comments)
            {
                // Map the User
                var userDto = new BasicUserDto()
                {
                    IdentityId = comment.User.IdentityId, // TODO: check if I need to send this
                    Username = comment.User.Username
                };

                var newCommentDto = new CommentDto()
                {
                    Id = comment.Id,
                    Text = comment.Text,
                    CreatedAt = comment.CreatedAt,
                    EditedAt = comment.EditedAt,
                    User = userDto,
                    Children = comment.Comments != null ? MapCommentDtos(comment.Comments) : null,
                };

                newCommentList.Add(newCommentDto);
            }
            return newCommentList;
        }
    }
}
