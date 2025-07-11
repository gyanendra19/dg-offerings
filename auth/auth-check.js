// Function to check if user is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include' // Important: needed for cookies to be sent
        });
        const data = await response.json();
        
        if (!data.success) {
            // User is not authenticated, redirect to login
            window.location.href = '/#login';
            return null;
        }
        
        return data.data; // Return user data if authenticated
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/#login';
        return null;
    }
}

// Function to update UI based on auth state
function updateAuthUI(user) {
    const userMenus = document.querySelectorAll('.user-menu');
    const authButtons = document.querySelectorAll('.auth-button');
    const userNameElements = document.querySelectorAll('.user-name');
    
    if (user) {
        // User is authenticated
        userMenus.forEach(menu => menu.style.display = 'flex');
        authButtons.forEach(btn => btn.style.display = 'none');
        userNameElements.forEach(elem => {
            if (elem) {
                elem.textContent = user.name;
            }
        });
    } else {
        // User is not authenticated
        userMenus.forEach(menu => menu.style.display = 'none');
        authButtons.forEach(btn => btn.style.display = 'block');
    }
}

// Initialize auth check when the script loads
document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuthentication();
    if (user) {
        updateAuthUI(user);
    }
}); 