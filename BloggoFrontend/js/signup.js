// Current year for footer
document.getElementById('year').textContent = new Date().getFullYear();

// Profile image upload preview
const profileUpload = document.getElementById('profile-upload');
const profilePreview = document.getElementById('profile-preview');

profileUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            profilePreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Membership plan selection
const membershipCards = document.querySelectorAll('.membership-card');
const membershipStatusInput = document.getElementById('membership-status');

membershipCards.forEach(card => {
    card.addEventListener('click', function() {
        membershipCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        membershipStatusInput.value = this.dataset.plan.toUpperCase();
    });
});

// Form validation and submission
const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Reset validation
    const inputs = signupForm.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    // Validate passwords match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        document.getElementById('confirm-password').classList.add('is-invalid');
        return;
    }

    // Validate terms checkbox
    if (!document.getElementById('terms').checked) {
        document.getElementById('terms').classList.add('is-invalid');
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('username', document.getElementById('username').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('password', password);
    formData.append('bio', document.getElementById('bio').value);
    formData.append('membershipStatus', membershipStatusInput.value);

    // Include profile image if uploaded
    if (profileUpload.files[0]) {
        formData.append('profileImage', profileUpload.files[0]);
    }

    // Here you would typically send the data to your server
    console.log('Form data:', Object.fromEntries(formData));

    // Simulate successful submission
    alert('Account created successfully! Redirecting to dashboard...');
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