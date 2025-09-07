
// Load logged-in user info for avatar
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:8080/user/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to load user");

        const user = await res.json();

        // Top navbar avatar
        const avatarEl = document.querySelector(".avatar");
        if (avatarEl) avatarEl.src = user.profileImage || "../assets/default.png";

    } catch (err) {
        console.error("Error loading user:", err);
    }
});

// Logout function
function logout() {
    preventBackNavigation();
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    window.location.href = 'signing.html';
}

// Prevent back navigation after logout
function preventBackNavigation() {
    window.history.replaceState(null, null, window.location.href);
    window.history.pushState(null, null, window.location.href);

    window.onpopstate = function() {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}
