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

        // Fill sidebar
        document.querySelector(".profile-avatar").src = user.profileImage || "../assets/client1.jpg";
        document.querySelector(".profile-name").textContent = user.username;
        document.querySelector(".profile-bio").textContent = user.bio || "No bio yet";

        // Top navbar avatar
        document.querySelector(".avatar").src = user.profileImage || "../assets/client1.jpg";

        // Toggle wallet & earnings for member
        if (user.roleName !== "MEMBER") {
            document.querySelector('.wallet').style.display = 'none';
            document.querySelector('.earnings').style.display = 'none';
        } else {
            // Fetch wallet & earnings
            const walletRes = await fetch(`http://localhost:8080/user/user/${user.userId}/wallet`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const wallet = await walletRes.json();
            console.log(wallet)

            document.querySelector('.wallet p').textContent = `LKR ${wallet.balance.toFixed(2)}`;
            const totalEarnings = wallet.earnings.reduce((sum, e) => sum + e.amount, 0);
            document.querySelector('.earnings p').textContent = `LKR ${totalEarnings.toFixed(2)}`;
        }

        // Followers count
        const followersLink = document.querySelector("#edit-profile-card p a");
        followersLink.textContent = `${user.followersCount} Followers`;
    } catch (err) {
        console.error("Error loading user:", err);
    }
});

function logout() {
    preventBackNavigation();
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Redirect to login page
    window.location.href = 'signing.html';
}

function preventBackNavigation() {
    // Replace current history entry
    window.history.replaceState(null, null, window.location.href);

    // Add new history entry
    window.history.pushState(null, null, window.location.href);

    // Handle back button press
    window.onpopstate = function () {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}