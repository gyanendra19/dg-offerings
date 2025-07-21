// Auth state management
let currentUser = null;

// Check authentication state
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include' // Important: needed for cookies to be sent
        });
        const data = await response.json();
        
        if (data.success) {
            // User is authenticated
            return data.data; // Returns user data
        } else {
            return null;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

// Initialize auth forms
function initializeForms() {
    console.log('Initializing auth forms');
    
    // Setup signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        console.log('Found signup form, adding listener');
        signupForm.addEventListener('submit', handleSignup);
    }

    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Found login form, adding listener');
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    console.log('Signup form submitted');
    
    const form = e.target;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Validate password match
    if (form.password.value !== form.confirmPassword.value) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
        return;
    }

    const formData = {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
            credentials: 'include' // Important: needed for cookies to be sent
        });

        const data = await response.json();

        if (data.success) {
            successMessage.textContent = 'Account created successfully! Redirecting to login...';
            successMessage.classList.add('show');
            errorMessage.classList.remove('show');
            
            // Redirect to login after a brief delay
            setTimeout(() => {
                window.location.hash = 'login';
            }, 2000);
        } else {
            errorMessage.textContent = data.error || 'Signup failed. Please try again.';
            errorMessage.classList.add('show');
            successMessage.classList.remove('show');
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const form = e.target;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    const formData = {
        email: form.email.value,
        password: form.password.value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
            credentials: 'include' // Important: needed for cookies to be sent
        });

        const data = await response.json();

        if (data.success) {
            successMessage.textContent = 'Login successful! Redirecting...';
            successMessage.classList.add('show');
            errorMessage.classList.remove('show');
            
            // Get the stored redirect URL or default to dashboard
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin'); // Clear the stored URL
            
            // Redirect after a brief delay
            setTimeout(() => {
                window.location.href = redirectUrl || '/';
            }, 1000);
        } else {
            errorMessage.textContent = data.error || 'Login failed. Please try again.';
            errorMessage.classList.add('show');
            successMessage.classList.remove('show');
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            credentials: 'include' // Important: needed for cookies to be sent
        });
        const data = await response.json();

        if (data.success) {
            // Redirect to home page
            window.location.pathname = '/';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Handle social authentication
async function handleSocialAuth(provider) {
    try {
        // Open the OAuth provider's login page
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
            `/api/auth/${provider}`,
            `${provider}Auth`,
            `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Listen for message from popup
        window.addEventListener('message', async (event) => {
            if (event.origin === '') {
                const { token, user } = event.data;
                if (token && user) {
                    localStorage.setItem('token', token);
                    currentUser = user;
                    window.location.href = '/dashboard';
                }
            }
        });
    } catch (error) {
        console.error(`${provider} auth error:`, error);
        showError('auth-error', `An error occurred during ${provider} authentication`);
    }
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Initialize forms when the script loads
initializeForms();

// Also initialize forms when the hash changes (for SPA navigation)
window.addEventListener('hashchange', initializeForms);

// Initialize forms when the DOM content changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            initializeForms();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
}); 