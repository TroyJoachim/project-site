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
                //Children = null,
            };

            return commentDto;
        }

        // GET: api/Comments/ProjectComments/5
        [HttpGet("ProjectComments/{projectId}")]
        public async Task<ActionResult<List<CommentDto>>> GetProjectComments(int projectId)
        {
            try
            {
                var result = await GetCommentDtos(projectId);
                if (result != null)
                {
                    return result;
                }
                return StatusCode(500);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }

        // GET: api/Comments/ChildComments/5
        [HttpGet("ChildComments/{parentId}")]
        public async Task<ActionResult<List<ChildCommentDto>>> GetChildComments(int parentId)
        {
            try
            {
                return await GetChildCommentDtos(parentId);
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
        public async Task<ActionResult<List<CommentDto>>> PostComment(PostCommentDto postComment)
        {
            try
            {
                Project project = null;
                BuildStep buildStep = null;
                var user = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == postComment.IdentityId);
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
                    User = user,
                    Project = project,
                    BuildStep = buildStep,
                };

                _context.Comments.Add(newComment);
                await _context.SaveChangesAsync();

                // Return the list of new comments
                var result = await GetCommentDtos(newComment.ProjectId);
                if (result != null)
                {
                    return result;
                }
                return StatusCode(500);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return StatusCode(500);
            }
        }

        // POST: api/ChildComments
        //[Authorize]
        [HttpPost("ChildComments/")]
        public async Task<ActionResult<List<ChildCommentDto>>> PostChildComment(PostChildCommentDto postChildComment)
        {
            try
            {
                Comment parentComment = null;
                var user = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == postChildComment.IdentityId);
                var replyTo = await _context.Users.SingleOrDefaultAsync(u => u.IdentityId == postChildComment.InReplyTo);
                parentComment = await _context.Comments.FindAsync(postChildComment.ParentId);

                var newChildComment = new ChildComment()
                {
                    Text = postChildComment.Text,
                    CreatedAt = DateTime.UtcNow,
                    EditedAt = DateTime.UtcNow,
                    User = user,
                    InReplyTo = replyTo,
                    Comment = parentComment,
                };

                _context.ChildComments.Add(newChildComment);
                await _context.SaveChangesAsync();

                // Return the list of new comments
                return await GetChildCommentDtos(newChildComment.CommentId);
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
                };

                newCommentList.Add(newCommentDto);
            }
            return newCommentList;
        }

        private async Task<List<CommentDto>> GetCommentDtos(int projectId)
        {
            try
            {
                var comments = await _context.Comments
                    .Include(c => c.User)
                    .Include(c => c.Children)
                    .Where(c => c.Project.Id == projectId)
                    .OrderBy(c => c.CreatedAt)
                    .Reverse()
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
                        ProjectId = comment.ProjectId,
                        ChildCount = comment.Children.Count,
                    };

                    newCommentList.Add(commentDto);
                }

                return newCommentList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return null;
            }
        }

        private async Task<List<ChildCommentDto>> GetChildCommentDtos(int parentId)
        {
            var childComments = await _context.ChildComments
                .Include(cc => cc.User)
                .Where(cc => cc.CommentId == parentId)
                .OrderBy(cc => cc.CreatedAt)
                .Reverse()
                .AsSplitQuery()
                .ToListAsync();

            var childCommentDtos = new List<ChildCommentDto>();
            foreach (var childComment in childComments)
            {
                var user = new BasicUserDto()
                {
                    IdentityId = childComment.User.IdentityId,
                    Username = childComment.User.Username,
                };

                BasicUserDto inReplyToUser = null;
                if (childComment.InReplyTo != null)
                {
                    inReplyToUser = new BasicUserDto()
                    {
                        IdentityId = childComment.InReplyTo.IdentityId,
                        Username = childComment.InReplyTo.Username,
                    };
                }

                var childCommentDto = new ChildCommentDto()
                {
                    Id = childComment.Id,
                    Text = childComment.Text,
                    CreatedAt = childComment.CreatedAt,
                    EditedAt = childComment.EditedAt,
                    User = user,
                    InReplyTo = inReplyToUser,
                    ParentId = childComment.CommentId,
                };

                childCommentDtos.Add(childCommentDto);
            }

            return childCommentDtos;
        }
    }
}
