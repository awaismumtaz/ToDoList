const BASE_URL = 'https://localhost:7288';

// Utility functions
async function fetchData(url, options = {}) {
    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// Add this helper function at the top of the file
function insertIcon(iconName) {
    return ICONS[iconName] || '';
}

// Projects
async function loadProjects() {
    const projects = await fetchData('/Project');
    const projectsList = document.getElementById('projectsList');
    const projectSelect = document.getElementById('projectSelect');
    
    projectsList.innerHTML = '';
    projectSelect.innerHTML = `<option value="">${insertIcon('PROJECT')} No Project</option>`;
    
    projects?.forEach(project => {
        const projectTags = project.tags?.map(tag => tag.name).join(', ') || 'No tags';
        
        const projectElement = document.createElement('div');
        projectElement.className = 'item';
        projectElement.innerHTML = `
            <div class="project-content">
                <div class="project-header">
                    <span class="item-name">${project.name}</span>
                    <span class="tag-list">Tags: ${projectTags}</span>
                </div>
            </div>
            <div class="project-actions">
                <button onclick="showProjectTagForm(${project.id})" 
                        class="icon-btn tag-btn" 
                        title="Manage Tags">
                    ${insertIcon('TAG')}
                </button>
                <button onclick="toggleProjectStatus(${project.id})" 
                        class="icon-btn complete-btn ${!project.isActive ? 'inactive' : ''}" 
                        title="${project.isActive ? 'Mark Inactive' : 'Mark Active'}">
                    ${insertIcon('ADD')}
                </button>
                <button onclick="deleteProject(${project.id})" 
                        class="icon-btn delete-btn" 
                        title="Delete">
                    ${insertIcon('DELETE')}
                </button>
            </div>
        `;
        projectsList.appendChild(projectElement);
        
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
    const projects = await fetchData('/Project');
    const tasksList = document.getElementById('tasksList');
    
    tasksList.innerHTML = '';
    tasks?.forEach(task => {
        const projectName = projects.find(p => p.id === task.projectId)?.name || 'No Project';
        const timeRemaining = getTimeRemaining(task.deadline);
        const deadlineClass = task.deadline ? 
            (new Date(task.deadline) < new Date() ? 'deadline-overdue' : 'deadline-active') : '';
        
        const taskElement = document.createElement('div');
        taskElement.className = `item ${task.isCompleted ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <div class="task-content">
                <div class="task-header">
                    <span class="item-name">${task.name}</span>
                    <span class="project-badge">${projectName}</span>
                </div>
                ${task.deadline ? `
                    <span class="deadline-badge ${deadlineClass}">
                        ${insertIcon('CLOCK')}
                        ${timeRemaining}
                    </span>
                ` : ''}
            </div>
            <div class="task-actions">
                <button onclick="toggleTaskCompletion(${task.id}, ${task.isCompleted})" 
                        class="icon-btn complete-btn ${task.isCompleted ? 'inactive' : ''}" 
                        title="${task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}">
                    ${insertIcon('ADD')}
                </button>
                <button onclick="deleteTask(${task.id})" 
                        class="icon-btn delete-btn" 
                        title="Delete">
                    ${insertIcon('DELETE')}
                </button>
            </div>
        `;
        tasksList.appendChild(taskElement);
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
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            <button onclick="deleteTag(${tag.id})" class="icon-btn delete-btn tag-delete" title="Delete">
                ${insertIcon('DELETE')}
            </button>
            <span class="tag-name">
                ${insertIcon('TAG')}
                ${tag.name}
            </span>
        `;
        tagsList.appendChild(tagElement);
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
            <h3>${insertIcon('TAG')}Manage Tags for ${project.name}</h3>
            <div class="tag-checkboxes">
                ${tags.map(tag => `
                    <label>
                        ${insertIcon('TAG')}
                        <input type="checkbox" 
                               value="${tag.id}" 
                               ${project.tags?.some(t => t.id === tag.id) ? 'checked' : ''}>
                        ${tag.name}
                    </label>
                `).join('')}
            </div>
            <div class="button-group">
                <button onclick="updateProjectTags(${projectId})" class="save-btn">
                    ${insertIcon('TASK')}Save
                </button>
                <button onclick="closeTagForm()" class="cancel-btn">
                    ${insertIcon('DELETE')}Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(form);
}

async function updateProjectTags(projectId) {
    
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
    
}

function closeTagForm() {
    const form = document.querySelector('.tag-form-overlay');
    if (form) form.remove();
}

// Add this helper function for formatting time
function getTimeRemaining(deadline) {
    if (!deadline) return '';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    
    if (timeDiff < 0) return 'Overdue';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
}

// Add this to update countdowns periodically
setInterval(() => {
    const tasks = document.querySelectorAll('.item');
    tasks.forEach(task => {
        const deadlineBadge = task.querySelector('.deadline-badge');
        if (deadlineBadge) {
            const deadline = task.getAttribute('data-deadline');
            if (deadline) {
                deadlineBadge.textContent = getTimeRemaining(deadline);
            }
        }
    });
}, 60000); // Update every minute

// Add this initialization function
function initializeUI() {
    // Initialize section headers
    document.getElementById('projectsHeader').innerHTML = `${insertIcon('PROJECT')}Projects`;
    document.getElementById('tasksHeader').innerHTML = `${insertIcon('TASK')}Tasks`;
    document.getElementById('tagsHeader').innerHTML = `${insertIcon('TAG')}Tags`;
    
    // Initialize buttons
    document.getElementById('addProjectBtn').innerHTML = `${insertIcon('ADD')}Add Project`;
    document.getElementById('addTaskBtn').innerHTML = `${insertIcon('ADD')}Add Task`;
    document.getElementById('createProjectBtn').innerHTML = `${insertIcon('ADD')}Create`;
    document.getElementById('createTaskBtn').innerHTML = `${insertIcon('ADD')}Create`;
    document.getElementById('addTagBtn').innerHTML = `${insertIcon('ADD')}Add Tag`;
    document.getElementById('createTagBtn').innerHTML = `${insertIcon('ADD')}Create`;
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadProjects();
    loadTasks();
    loadTags();
});

// Add error message styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .error-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid var(--danger);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .error-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .error-content .icon {
        color: var(--danger);
    }

    .error-content button {
        padding: 0.25rem 0.75rem;
        background: var(--gray-200);
        color: var(--gray-700);
        border-radius: 0.375rem;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(styleSheet);

function handleTaskInput(event) {
    if (event.key === 'Enter') {
        const taskName = event.target.value.trim();
        if (taskName) {
            createQuickTask(taskName);
            event.target.value = '';
        }
    }
}

async function createQuickTask(name) {
    const task = {
        name: name,
        isCompleted: false
    };
    
    await fetchData('/TaskItem', {
        method: 'POST',
        body: JSON.stringify(task)
    });
    
    await loadTasks();
}

function showFullTaskForm() {
    const taskName = document.getElementById('taskName').value;
    document.getElementById('taskForm').style.display = 'flex';
}

function hideFullTaskForm() {
    document.getElementById('taskForm').style.display = 'none';
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'item';
    
    // Only show project and deadline if they exist
    const projectBadge = task.projectId ? 
        `<span class="project-badge">${task.projectName || 'No Project'}</span>` : '';
    
    const deadlineBadge = task.deadline ? 
        `<span class="deadline-badge">${insertIcon('CLOCK')}${formatDate(task.deadline)}</span>` : '';

    // Only show the details div if there are details to show
    const detailsDiv = (task.projectId || task.deadline) ? 
        `<div class="task-details">
            ${projectBadge}
            ${deadlineBadge}
        </div>` : '';

    taskElement.innerHTML = `
        <div class="task-content">
            <div class="task-header">
                <span class="item-name ${task.isCompleted ? 'completed' : ''}">${task.name}</span>
                ${detailsDiv}
            </div>
        </div>
        <div class="task-actions">
            <button onclick="toggleTaskStatus(${task.id})" class="icon-btn complete-btn" title="Toggle Status">
                ${insertIcon('TASK')}
            </button>
            <button onclick="deleteTask(${task.id})" class="icon-btn delete-btn" title="Delete">
                ${insertIcon('DELETE')}
            </button>
        </div>
    `;
    
    return taskElement;
} 