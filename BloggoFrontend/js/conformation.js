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
        document.querySelector(".avatar").src = user.profileImage || "../assets/default.png";
    } catch (err) {
        console.error("Error loading user:", err);
    }
});

function logout() {
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Redirect to login page
    window.location.href = 'login.html';
}