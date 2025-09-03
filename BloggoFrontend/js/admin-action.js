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

    preventBackNavigation();

    // Redirect to login page
    window.location.href = 'signing.html';
}

function preventBackNavigation() {
    // Replace current history entry
    window.history.replaceState(null, null, window.location.href);

    // Add new history entry
    window.history.pushState(null, null, window.location.href);

    // Handle back button press
    window.onpopstate = function() {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}