using Microsoft.AspNetCore.Mvc;
using ToDoList.Models;
using Microsoft.EntityFrameworkCore;
using ToDoList;

[ApiController]
[Route("[controller]")]
public class ProjectController : Controller
{
    private readonly TodoContext _context;

    public ProjectController(TodoContext context)
    {
        _context = context;
    }
    
    // GET
    [HttpGet]
    public async Task<ActionResult<List<Project>>> Index()
    {
        return await _context.Projects.ToListAsync();
    }
    
    // GET by Id
    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> Get(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();
        return project;
    }
    
    // POST
    [HttpPost]
    public async Task<ActionResult<Project>> Create(Project project)
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = project.Id }, project);
    }
    
    // PUT
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, Project project)
    {
        if (id != project.Id) return BadRequest();
        
        _context.Entry(project).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
    
    // DELETE
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();
        
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Add this method to the existing ProjectController class
    [HttpPatch("{id}/toggle-status")]
    public async Task<ActionResult> ToggleStatus(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();
        
        project.IsActive = !project.IsActive;
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
}