// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/';
            return;
        }
        const data = await response.json();
        document.getElementById('username').textContent = data.login;
        loadRepos();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/';
    }
}

// Load repositories
async function loadRepos() {
    try {
        const response = await fetch('/api/repos');
        const repos = await response.json();
        displayRepos(repos);
    } catch (error) {
        console.error('Failed to load repos:', error);
    }
}

// Display repositories with deploy buttons
function displayRepos(repos) {
    const reposContainer = document.getElementById('repos');
    reposContainer.innerHTML = repos.map(repo => `
        <div class="repo-card">
            <h3>${repo.name}</h3>
            <p>${repo.description || 'No description available'}</p>
            <div class="repo-stats">
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🔱 ${repo.forks_count}</span>
                ${repo.language ? `<span>💻 ${repo.language}</span>` : ''}
            </div>
            <button class="btn-deploy" onclick="openDeployModal('${repo.full_name}', '${repo.html_url}')">
                Deploy
            </button>
        </div>
    `).join('');
}

// Modal management
const deployModal = document.getElementById('deployModal');
const advancedModal = document.getElementById('advancedModal');
const closeBtn = document.querySelector('.close');
const closeAdvancedBtn = document.querySelector('.close-advanced');
const advancedSettingsBtn = document.getElementById('advancedSettingsBtn');

let currentRepo = null;

// Open deploy modal
function openDeployModal(fullName, url) {
    currentRepo = { fullName, url };
    document.getElementById('repository').value = fullName;
    deployModal.style.display = 'block';
    clearFormErrors();
}

// Close deploy modal
closeBtn.onclick = function() {
    deployModal.style.display = 'none';
    resetDeployForm();
}

// Close advanced modal
closeAdvancedBtn.onclick = function() {
    advancedModal.style.display = 'none';
}

// Open advanced settings
advancedSettingsBtn.onclick = function(e) {
    e.preventDefault();
    advancedModal.style.display = 'block';
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target == deployModal) {
        deployModal.style.display = 'none';
        resetDeployForm();
    }
    if (event.target == advancedModal) {
        advancedModal.style.display = 'none';
    }
}

// Form validation
function validateField(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (!field.value.trim()) {
        field.classList.add('error');
        error.classList.add('show');
        return false;
    } else {
        field.classList.remove('error');
        error.classList.remove('show');
        return true;
    }
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
}

// Deploy form submission
document.getElementById('deployForm').onsubmit = async function(e) {
    e.preventDefault();
    
    // Validate required fields
    const repoValid = validateField('repository', 'repoError');
    const branchValid = validateField('branch', 'branchError');
    const filePathValid = validateField('mainFilePath', 'filePathError');
    
    if (!repoValid || !branchValid || !filePathValid) {
        return;
    }
    
    // Collect form data
    const formData = {
        repository: document.getElementById('repository').value,
        branch: document.getElementById('branch').value,
        mainFilePath: document.getElementById('mainFilePath').value,
        appUrl: document.getElementById('appUrl').value,
        pythonVersion: document.getElementById('pythonVersion').value,
        secrets: document.getElementById('secrets').value
    };
    
    console.log('Deploying with data:', formData);
    
    // TODO: Send to backend
    alert('Deployment initiated! (Backend integration pending)');
    deployModal.style.display = 'none';
    resetDeployForm();
}

// Advanced settings form submission
document.getElementById('advancedForm').onsubmit = function(e) {
    e.preventDefault();
    alert('Advanced settings saved!');
    advancedModal.style.display = 'none';
}

// Reset deploy form
function resetDeployForm() {
    document.getElementById('deployForm').reset();
    clearFormErrors();
    currentRepo = null;
}

// Logout
function logout() {
    window.location.href = '/auth/logout';
}

// Initialize
if (window.location.pathname === '/dashboard.html') {
    checkAuth();
}
