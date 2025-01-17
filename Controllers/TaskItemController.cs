using Microsoft.AspNetCore.Mvc;
using ToDoList.Models;
using Microsoft.EntityFrameworkCore;
using ToDoList;

namespace ToDoList.Controllers;

[ApiController]
[Route("[controller]")]
public class TaskItemController : Controller
{
    private readonly TodoContext _context;

    public TaskItemController(TodoContext context)
    {
        _context = context;
    }
    
    // GET
    [HttpGet]
    public async Task<ActionResult<List<TaskItem>>> Index()
    {
        return await _context.Tasks.ToListAsync();
    }
    
    // GET by Id
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> Get(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        return task;
    }
    
    // POST
    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
    }
    
    // PUT
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, TaskItem task)
    {
        if (id != task.Id) return BadRequest();
        
        _context.Entry(task).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
    
    // DELETE
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }
} 