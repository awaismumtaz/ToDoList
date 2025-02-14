const BASE_URL = 'https://localhost:7288';

// Utility functions
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}

// Projects
async function loadProjects() {
    const projects = await fetchData('/Project');
    const tags = await fetchData('/Tag');
    const projectsList = document.getElementById('projectsList');
    const projectSelect = document.getElementById('projectSelect');
    
    projectsList.innerHTML = '';
    projectSelect.innerHTML = '<option value="">No Project</option>';
    
    projects?.forEach(project => {
        const projectTags = project.tags?.map(tag => tag.name).join(', ') || 'No tags';
        
        projectsList.innerHTML += `
            <div class="item">
                <div>
                    <span class="item-name">${project.name}</span>
                    <span class="tag-list">Tags: ${projectTags}</span>
                </div>
                <div>
                    <button onclick="showProjectTagForm(${project.id})" class="tag-btn">Manage Tags</button>
                    <button onclick="toggleProjectStatus(${project.id})" class="complete-btn">
                        ${project.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onclick="deleteProject(${project.id})" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
        
        projectSelect.innerHTML += `
            <option value="${project.id}">${project.name}</option>
        `;
    });
}

async function createProject() {
    const name = document.getElementById('projectName').value;
    if (!name) return alert('Please enter a project name');
    
    await fetchData('/Project', {
        method: 'POST',
        body: JSON.stringify({ name, isActive: true })
    });
    
    document.getElementById('projectName').value = '';
    document.getElementById('projectForm').style.display = 'none';
    await loadProjects();
}

async function toggleProjectStatus(id) {
    await fetchData(`/Project/${id}/toggle-status`, { method: 'PATCH' });
    await loadProjects();
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    await fetchData(`/Project/${id}`, { method: 'DELETE' });
    await loadProjects();
}

// Tasks
async function loadTasks() {
    const tasks = await fetchData('/TaskItem');
    const projects = await fetchData('/Project'); // Get projects to show names
    const tasksList = document.getElementById('tasksList');
    
    tasksList.innerHTML = '';
    tasks?.forEach(task => {
        const projectName = projects.find(p => p.id === task.projectId)?.name || 'No Project';
        tasksList.innerHTML += `
            <div class="item ${task.isCompleted ? 'completed' : ''}">
                <div>
                    <span class="item-name">${task.name}</span>
                    <span class="project-badge">${projectName}</span>
                </div>
                <div>
                    <button onclick="toggleTaskCompletion(${task.id}, ${task.isCompleted})" class="complete-btn">
                        ${task.isCompleted ? 'Completed' : 'Complete'}
                    </button>
                    <button onclick="deleteTask(${task.id})" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    });
}

async function createTask() {
    const name = document.getElementById('taskName').value;
    const deadline = document.getElementById('taskDeadline').value;
    const projectId = document.getElementById('projectSelect').value;
    
    if (!name) return alert('Please enter a task name');
    
    await fetchData('/TaskItem', {
        method: 'POST',
        body: JSON.stringify({
            name,
            deadline: deadline || null,
            projectId: projectId || null,
            isCompleted: false
        })
    });
    
    document.getElementById('taskName').value = '';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('projectSelect').value = '';
    document.getElementById('taskForm').style.display = 'none';
    await loadTasks();
}

async function toggleTaskCompletion(id, currentStatus) {
    // First get the existing task data
    const task = await fetchData(`/TaskItem/${id}`);
    if (!task) return;

    // Update only the isCompleted status while preserving other properties
    const updatedTask = {
        ...task,
        isCompleted: !currentStatus
    };

    await fetchData(`/TaskItem/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTask)
    });
    
    await loadTasks();
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    await fetchData(`/TaskItem/${id}`, { method: 'DELETE' });
    await loadTasks();
}

// Form visibility toggles
function showAddProjectForm() {
    document.getElementById('projectForm').style.display = 'flex';
}

function showAddTaskForm() {
    document.getElementById('taskForm').style.display = 'flex';
}

// Tags
async function loadTags() {
    const tags = await fetchData('/Tag');
    const tagsList = document.getElementById('tagsList');
    
    tagsList.innerHTML = '';
    tags?.forEach(tag => {
        tagsList.innerHTML += `
            <div class="item">
                <span>${tag.name}</span>
                <div>
                    <button onclick="deleteTag(${tag.id})" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    });
}

async function createTag() {
    const name = document.getElementById('tagName').value;
    if (!name) return alert('Please enter a tag name');
    
    await fetchData('/Tag', {
        method: 'POST',
        body: JSON.stringify({ name })
    });
    
    document.getElementById('tagName').value = '';
    document.getElementById('tagForm').style.display = 'none';
    await loadTags();
}

async function deleteTag(id) {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    await fetchData(`/Tag/${id}`, { method: 'DELETE' });
    await loadTags();
}

function showAddTagForm() {
    document.getElementById('tagForm').style.display = 'flex';
}

// Add project tag management
async function showProjectTagForm(projectId) {
    const tags = await fetchData('/Tag');
    const project = await fetchData(`/Project/${projectId}`);
    
    const form = document.createElement('div');
    form.className = 'tag-form-overlay';
    form.innerHTML = `
        <div class="tag-form">
            <h3>Manage Tags for ${project.name}</h3>
            <div class="tag-checkboxes">
                ${tags.map(tag => `
                    <label>
                        <input type="checkbox" 
                               value="${tag.id}" 
                               ${project.tags?.some(t => t.id === tag.id) ? 'checked' : ''}>
                        ${tag.name}
                    </label>
                `).join('')}
            </div>
            <div class="button-group">
                <button onclick="updateProjectTags(${projectId})" class="save-btn">Save</button>
                <button onclick="closeTagForm()" class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(form);
}

async function updateProjectTags(projectId) {
    try {
        const selectedTagIds = Array.from(document.querySelectorAll('.tag-checkboxes input:checked'))
            .map(checkbox => parseInt(checkbox.value));
        
        const updatedProject = {
            id: projectId,
            tags: selectedTagIds
        };
        
        await fetchData(`/Project/${projectId}/update-tags`, {
            method: 'POST',
            body: JSON.stringify(updatedProject)
        });
        
        closeTagForm();
        await loadProjects();
    } catch (error) {
        console.error('Error updating project tags:', error);
        alert('Failed to update tags. Please try again.');
    }
}

function closeTagForm() {
    const form = document.querySelector('.tag-form-overlay');
    if (form) form.remove();
}

// Initial load
window.onload = async () => {
    await loadProjects();
    await loadTasks();
    await loadTags();
}; 