using Microsoft.EntityFrameworkCore;
using ToDoList.Models;

namespace ToDoList;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options) { }

    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<TaskItem> Tasks { get; set; } = null!;
}