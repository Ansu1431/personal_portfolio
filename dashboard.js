// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Parse user data
    const userData = JSON.parse(user);
    document.getElementById('userName').textContent = userData.full_name || userData.username;

    // Tab switching functionality
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all menu items and tab contents
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked menu item and corresponding tab
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Load data for the selected tab
            loadTabData(targetTab);
        });
    });

    // Load initial data for overview tab
    loadTabData('overview');

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('user');
        localStorage.removeItem('rememberedUsername');
        window.location.href = 'login.html';
    });

    // Form submissions
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
    document.getElementById('portfolioForm').addEventListener('submit', handlePortfolioSettings);
    const resumeForm = document.getElementById('resumeForm');
    if (resumeForm) resumeForm.addEventListener('submit', uploadResume);
});

// Load data for specific tabs
function loadTabData(tabName) {
    switch(tabName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'settings':
            loadPortfolioSettings();
            break;
    }
}

// Load overview data
async function loadOverviewData() {
    try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/dashboard?action=overview', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
        const data = await response.json();
        
        if (data.success) {
            // Update stats
            document.getElementById('totalMessages').textContent = data.data.totalMessages || 0;
            document.getElementById('totalViews').textContent = data.data.totalViews || 0;
            document.getElementById('thisMonth').textContent = data.data.thisMonth || 0;
            document.getElementById('messageCount').textContent = data.data.unreadMessages || 0;
            
            // Load recent activity
            loadRecentActivity(data.data.recentActivity || []);
        }
    } catch (error) {
        console.error('Error loading overview data:', error);
        showMessage('Failed to load overview data', 'error');
    }
}

// Load recent activity
function loadRecentActivity(activities) {
    const activityList = document.getElementById('activityList');
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <h4>No recent activity</h4>
                <p>Your recent activities will appear here</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${formatTime(activity.created_at)}</div>
        </div>
    `).join('');
}

// Get activity icon based on type
function getActivityIcon(type) {
    const icons = {
        'message': 'fas fa-envelope',
        'login': 'fas fa-sign-in-alt',
        'profile': 'fas fa-user-edit',
        'settings': 'fas fa-cog'
    };
    return icons[type] || 'fas fa-info-circle';
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}

// Load messages
async function loadMessages() {
    try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/dashboard?action=messages', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
        const data = await response.json();
        
        if (data.success) {
            displayMessages(data.data.messages || []);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showMessage('Failed to load messages', 'error');
    }
}

// Display messages
function displayMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h4>No messages yet</h4>
                <p>Contact form messages will appear here</p>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = messages.map(message => `
        <div class="message-item ${message.is_read ? '' : 'unread'}">
            <div class="message-header">
                <div class="message-sender">${message.name}</div>
                <div class="message-time">${formatTime(message.created_at)}</div>
            </div>
            <div class="message-subject">${message.subject}</div>
            <div class="message-content">${message.message}</div>
            <div class="message-email">${message.email}</div>
        </div>
    `).join('');
}

// Refresh messages
function refreshMessages() {
    loadMessages();
    showMessage('Messages refreshed', 'success');
}

// Load profile data
async function loadProfileData() {
    try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : null;
    let url = '/api/dashboard?action=profile';
    if (userId) url += '&userId=' + encodeURIComponent(userId);
    const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            const profile = data.data.profile;
            document.getElementById('profileName').value = profile.full_name || '';
            document.getElementById('profileEmail').value = profile.email || '';
            document.getElementById('profileUsername').value = profile.username || '';
                // Resume link if present
                if (profile.resume_path) {
                    const rl = document.getElementById('resumeLink');
                    rl.innerHTML = `<a href="${profile.resume_path}" target="_blank">View Resume</a>`;
                }
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        showMessage('Failed to load profile data', 'error');
    }
}

// Load portfolio settings
async function loadPortfolioSettings() {
    try {
    const response = await fetch('/api/dashboard?action=settings');
        const data = await response.json();
        
        if (data.success) {
            const settings = data.data.settings;
            const form = document.getElementById('portfolioForm');
            
            form.querySelector('[name="portfolio_title"]').value = settings.portfolio_title || '';
            form.querySelector('[name="about_me"]').value = settings.about_me || '';
            form.querySelector('[name="contact_email"]').value = settings.contact_email || '';
            form.querySelector('[name="phone_number"]').value = settings.phone_number || '';
            form.querySelector('[name="location"]').value = settings.location || '';
        }
    } catch (error) {
        console.error('Error loading portfolio settings:', error);
        showMessage('Failed to load portfolio settings', 'error');
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
    const response = await fetch('/api/dashboard?action=update_profile', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Profile updated successfully', 'success');
            // Update local storage if needed
            const user = JSON.parse(localStorage.getItem('user'));
            user.full_name = formData.get('full_name');
            user.email = formData.get('email');
            user.username = formData.get('username');
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            showMessage(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Failed to update profile', 'error');
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');
    
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
    const response = await fetch('/api/dashboard?action=change_password', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Password changed successfully', 'success');
            e.target.reset();
        } else {
            showMessage(data.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage('Failed to change password', 'error');
    }
}

// Handle portfolio settings
async function handlePortfolioSettings(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
    const response = await fetch('/api/dashboard?action=update_settings', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Portfolio settings updated successfully', 'success');
        } else {
            showMessage(data.message || 'Failed to update settings', 'error');
        }
    } catch (error) {
        console.error('Error updating portfolio settings:', error);
        showMessage('Failed to update portfolio settings', 'error');
    }
}

// Upload resume PDF
async function uploadResume(e) {
    e.preventDefault();
    const fileInput = document.getElementById('resumeInput');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showMessage('Please select a PDF to upload', 'error');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('resume', file);
    // Attach user id so server can persist resume_path to user's row
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : null;
    if (userId) formData.append('userId', userId);

    try {
        const response = await fetch('/api/upload-resume', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            const rl = document.getElementById('resumeLink');
            rl.innerHTML = `<a href="${data.path}" target="_blank">View Resume</a>`;
            showMessage('Resume uploaded successfully', 'success');
        } else {
            showMessage(data.message || 'Upload failed', 'error');
        }
    } catch (err) {
        console.error('Upload error', err);
        showMessage('Upload failed', 'error');
    }
}

// Show message notification
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const dashboardMain = document.querySelector('.dashboard-main');
    dashboardMain.insertBefore(messageDiv, dashboardMain.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Mobile navigation toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Auto-refresh data every 30 seconds
setInterval(() => {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabName = activeTab.id;
        loadTabData(tabName);
    }
}, 30000);

// Add loading states to forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            // Re-enable button after 5 seconds as fallback
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
            }, 5000);
        }
    });
});

// Store original button text
document.querySelectorAll('button[type="submit"]').forEach(btn => {
    btn.setAttribute('data-original-text', btn.textContent);
}); 