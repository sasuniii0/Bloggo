document.addEventListener("DOMContentLoaded", () => {
    logout();
});

function logout() {
    preventBackNavigation();

    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Optionally, show a message briefly before redirecting
    setTimeout(() => {
        window.location.href = 'signing.html'; // Redirect to login page
    }, 1500); // 1.5 seconds delay
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