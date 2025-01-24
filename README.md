# ToDo List API

A RESTful API built with ASP.NET Core and Entity Framework Core for managing tasks, projects, and tags.

## Features

- Full CRUD operations for:
  - Tasks
  - Projects
  - Tags
- SQLite database
- Swagger UI for API testing and documentation
- Async operations
- RESTful endpoints

## API Endpoints

### Tasks
- `GET /task` - Get all tasks
- `GET /task/{id}` - Get a specific task
- `POST /task` - Create a new task
- `PUT /task/{id}` - Update an existing task
- `DELETE /task/{id}` - Delete a task

### Projects
- `GET /project` - Get all projects
- `GET /project/{id}` - Get a specific project
- `POST /project` - Create a new project
- `PUT /project/{id}` - Update an existing project
- `DELETE /project/{id}` - Delete a project

### Tags
- `GET /tag` - Get all tags
- `GET /tag/{id}` - Get a specific tag
- `POST /tag` - Create a new tag
- `PUT /tag/{id}` - Update an existing tag
- `DELETE /tag/{id}` - Delete a tag

## Tech Stack

- ASP.NET Core 7.0
- Entity Framework Core
- SQLite
- Swagger/OpenAPI

## Getting Started

1. Clone the repository
2. Install dependencies: