// Current year for footer
document.getElementById('year').textContent = new Date().getFullYear();

// Form validation and submission
const signinForm = document.getElementById('signin-form');

signinForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Reset validation
    const inputs = signinForm.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    // Get form values
    const emailOrUsername = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Simple validation
    if (!emailOrUsername) {
        document.getElementById('email').classList.add('is-invalid');
        return;
    }

    if (!password) {
        document.getElementById('password').classList.add('is-invalid');
        return;
    }

    // Prepare login data
    const loginData = {
        emailOrUsername,
        password,
        rememberMe
    };

    // Here you would typically send the data to your server
    console.log('Login data:', loginData);

    // Simulate successful login
    alert('Login successful! Redirecting to dashboard...');
    // window.location.href = 'dashboard.html';
});

// OAuth button handlers
document.getElementById('google-auth').addEventListener('click', () => {
    alert('Google OAuth would be implemented here');
    // Implement Google OAuth flow
});

document.getElementById('facebook-auth').addEventListener('click', () => {
    alert('Facebook OAuth would be implemented here');
    // Implement Facebook OAuth flow
});

document.getElementById('linkedin-auth').addEventListener('click', () => {
    alert('LinkedIn OAuth would be implemented here');
    // Implement LinkedIn OAuth flow
});