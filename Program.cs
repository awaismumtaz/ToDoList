using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ToDoList;

var builder = WebApplication.CreateBuilder(args);

const string sitePolicy = "MyPolicy";
//Add controllers
builder.Services.AddControllers();
//Json
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
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

//Add the database
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseSqlite("Data Source=todo.db"));
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
