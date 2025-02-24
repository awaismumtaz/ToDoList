using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ToDoList;

var builder = WebApplication.CreateBuilder(args);
DotNetEnv.Env.Load();
string? todoDb = Environment.GetEnvironmentVariable("SQLite_SRC");
const string sitePolicy = "MyPolicy";
//Add the database
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseSqlite(todoDb));
//Add controllers
builder.Services.AddControllers();
//Json
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: sitePolicy, built =>
    {
        built.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors(sitePolicy);
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


app.Run();
