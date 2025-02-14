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
        return await _context.Projects
            .Include(p => p.Tags)
            .ToListAsync();
    }
    
    // GET by Id
    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> Get(int id)
    {
        var project = await _context.Projects
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id);
        
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
        
        // Get the existing project with its tags
        var existingProject = await _context.Projects
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id);
        
        if (existingProject == null) return NotFound();
        
        // Update basic properties
        existingProject.Name = project.Name;
        existingProject.IsActive = project.IsActive;
        
        // Clear existing tags and add new ones
        existingProject.Tags.Clear();
        if (project.Tags != null)
        {
            foreach (var tagId in project.Tags.Select(t => t.Id))
            {
                var tag = await _context.Tags.FindAsync(tagId);
                if (tag != null)
                {
                    existingProject.Tags.Add(tag);
                }
            }
        }
        
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

    [HttpPost("{id}/update-tags")]
    public async Task<ActionResult> UpdateTags(int id, [FromBody] ProjectTagUpdateModel model)
    {
        var project = await _context.Projects
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id);
        
        if (project == null) return NotFound();
        
        project.Tags.Clear();
        
        if (model.Tags != null && model.Tags.Any())
        {
            foreach (var tagId in model.Tags)
            {
                var tag = await _context.Tags.FindAsync(tagId);
                if (tag != null)
                {
                    project.Tags.Add(tag);
                }
            }
        }
        
        await _context.SaveChangesAsync();
        return NoContent();
    }

    public class ProjectTagUpdateModel
    {
        public int Id { get; set; }
        public List<int> Tags { get; set; } = new List<int>();
    }
}