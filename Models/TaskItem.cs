using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class TaskItem
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public DateTime? Deadline { get; set; }
    
    public bool IsCompleted { get; set; } = false;
    
    public int? ProjectId { get; set; }
    public Project? Project { get; set; }
    
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}