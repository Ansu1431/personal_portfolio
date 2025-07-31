// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');

    // Password toggle functionality
    window.togglePassword = function() {
        const passwordToggle = document.querySelector('.password-toggle i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            passwordToggle.className = 'fas fa-eye';
        }
    };

    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Reset previous error states
        clearErrors();
        
        // Username validation
        if (!usernameInput.value.trim()) {
            showError(usernameInput, 'Username is required');
            isValid = false;
        } else if (usernameInput.value.trim().length < 3) {
            showError(usernameInput, 'Username must be at least 3 characters');
            isValid = false;
        }
        
        // Password validation
        if (!passwordInput.value) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        return isValid;
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }

    function clearErrors() {
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    function showSuccess(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        
        setTimeout(() => {
            formGroup.classList.remove('success');
        }, 2000);
    }

    // Real-time validation
    usernameInput.addEventListener('blur', function() {
        if (this.value.trim() && this.value.trim().length >= 3) {
            showSuccess(this);
        }
    });

    passwordInput.addEventListener('blur', function() {
        if (this.value && this.value.length >= 6) {
            showSuccess(this);
        }
    });

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        
        try {
            const formData = new FormData(loginForm);
            
            // Send login request to backend
            const response = await fetch('backend/login.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Login successful! Redirecting...', 'success');
                
                // Store user data if needed
                if (result.user) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                
                // Redirect to dashboard or home page
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification(result.message || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('An error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    });

    // Social login buttons
    document.querySelector('.google-btn').addEventListener('click', function() {
        showNotification('Google login functionality coming soon!', 'info');
    });

    document.querySelector('.github-btn').addEventListener('click', function() {
        showNotification('GitHub login functionality coming soon!', 'info');
    });

    // Forgot password link
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Password reset functionality coming soon!', 'info');
    });

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#00d4ff';
                break;
            case 'error':
                notification.style.background = '#ff6b6b';
                break;
            case 'info':
                notification.style.background = '#333';
                break;
            default:
                notification.style.background = '#333';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Input focus effects
    const inputs = document.querySelectorAll('.input-icon input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Remember me functionality
    const rememberCheckbox = document.getElementById('remember');
    const savedUsername = localStorage.getItem('rememberedUsername');
    
    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberCheckbox.checked = true;
    }
    
    rememberCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('rememberedUsername', usernameInput.value);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
    });

    // Auto-save username when typing
    usernameInput.addEventListener('input', function() {
        if (rememberCheckbox.checked) {
            localStorage.setItem('rememberedUsername', this.value);
        }
    });

    // Enter key to submit form
    loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });

    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
        showNotification('You are already logged in!', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Add some visual feedback for form interactions
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value) {
                this.style.borderColor = 'var(--primary-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    });

    // Prevent form submission on Enter if validation fails
    loginForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !validateForm()) {
            e.preventDefault();
        }
    });
});

// Add some additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced validation for better performance
const debouncedValidation = debounce(function(input) {
    if (input.value.trim()) {
        input.closest('.form-group').classList.add('success');
        setTimeout(() => {
            input.closest('.form-group').classList.remove('success');
        }, 2000);
    }
}, 500);

// Apply debounced validation to inputs
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.input-icon input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            debouncedValidation(this);
        });
    });
}); 