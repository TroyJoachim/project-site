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
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/UserExists/5
        [HttpGet("UserExists/{identityId}")]
        public async Task<IActionResult> UserExists(string identityId)
        {
            var result = await _context.Users.AnyAsync(e => e.IdentityId == identityId);
            return result ? NoContent() : NotFound();
        }

        // GET: api/Users/5
        [HttpGet("{identityId}")]
        public async Task<ActionResult<User>> GetUser(string identityId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdentityId == identityId);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{identityId}")]
        public async Task<IActionResult> PutUser(string identityId, PutUserDto user)
        {
            if (identityId != user.IdentityId)
            {
                return BadRequest();
            }

            var userToUpdate = await _context.Users.FirstOrDefaultAsync(u => u.IdentityId == identityId);
            if (user.Username != null) userToUpdate.Username = user.Username;
            if (user.FirstName != null) userToUpdate.FirstName = user.FirstName;
            if (user.LastName != null) userToUpdate.LastName = user.LastName;
            if (user.AvatarImgKey != null) userToUpdate.AvatarImgKey = user.AvatarImgKey;            

            _context.Entry(userToUpdate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PrivateUserExists(identityId))
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

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserDto>> PostUser(UserDto user)
        {
            // Map UserDto to User
            var newUser = new User()
            {
                IdentityId = user.IdentityId,
                Sub = user.Sub,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { IdentityId = newUser.IdentityId }, user);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PrivateUserExists(string identityId)
        {
            return _context.Users.Any(e => e.IdentityId == identityId);
        }
    }
}
