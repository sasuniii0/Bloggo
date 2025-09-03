// Example: confirm before banning a user
document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', function () {
        if (!confirm("Are you sure you want to ban this user?")) {
            event.preventDefault();
        }
    });
});

function logout() {
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Redirect to login page
    window.location.href = 'login.html';
}