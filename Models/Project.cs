namespace ToDoList.Models;
using System.ComponentModel.DataAnnotations;

public class Project
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}