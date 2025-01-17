using Microsoft.AspNetCore.Mvc;
using ToDoList.Models;
using Microsoft.EntityFrameworkCore;
using ToDoList;

namespace ToDoList.Controllers;

[ApiController]
[Route("[controller]")]
public class TagController : Controller
{
    private readonly TodoContext _context;

    public TagController(TodoContext context)
    {
        _context = context;
    }
    // GET
    [HttpGet]
    public async Task<ActionResult<List<Tag>>> Index()
    {
        return await _context.Tags.ToListAsync();
    }
    
    // GET by Id
    [HttpGet("{id}")]
    public async Task<ActionResult<Tag>> Get(int id)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return NotFound();
        return tag;
    }
    
    // POST
    [HttpPost]
    public async Task<ActionResult<Tag>> Create(Tag tag)
    {
        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = tag.Id }, tag);
    }
    
    // PUT
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, Tag tag)
    {
        if (id != tag.Id) return BadRequest();
        
        _context.Entry(tag).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
    
    // DELETE
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return NotFound();
        
        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}              