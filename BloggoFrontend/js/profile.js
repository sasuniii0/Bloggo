document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];


    if (!token) return;

    try {
        const res = await fetch("http://localhost:8080/user/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const response = await fetch(`http://localhost:8080/api/v1/follows/${userId}/count`,{
            headers:{
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)throw new Error("Failed to load followers")
        const count = await response.json();
        console.log(count)

        if (!res.ok) throw new Error("Failed to load user");

        const user = await res.json();
        console.log(user)

        // Fill sidebar
        document.querySelector(".profile-avatar").src = user.profileImage || "../assets/client1.jpg";
        document.querySelector(".profile-name").textContent = user.username;
        document.querySelector(".profile-bio").textContent = user.bio || "No bio yet";
        const followersEl = document.querySelector("#edit-profile-card p a");
        if (followersEl) followersEl.textContent = `${count.data || 0} Followers`;

        const roleBadge = document.querySelector('.profile-name + small');
        if (user.roleName === "MEMBER") {
            roleBadge.innerHTML = `<i class="fas fa-star text-warning me-1"></i> Premium Member`;
        } else {
            roleBadge.textContent = "User";
        }


        // Top navbar avatar
        document.querySelector(".avatar").src = user.profileImage || "../assets/client1.jpg";

        // Toggle wallet & earnings for member
        if (user.roleName === "MEMBER") {
            // Fetch wallet & earnings
            const walletRes = await fetch(`http://localhost:8080/user/getWallet/${user.userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const walletApiResponse = await walletRes.json();
            console.log("Full wallet API response:", walletApiResponse);

            // Handle both object & array
            let walletData = walletApiResponse.data || {};
            if (Array.isArray(walletData)) {
                walletData = walletData[0] || {};
            }

            // Use balance safely
            const walletBalance = walletData.balance || 0;

            const walletEarningsDiv = document.createElement("div");
            walletEarningsDiv.classList.add("d-flex", "gap-3", "mb-3");
            walletEarningsDiv.innerHTML = `
        <div class="wallet flex-fill p-3 bg-light rounded d-flex align-items-center justify-content-between">
            <div>
                <h6 class="mb-1"><i class="fas fa-wallet me-2 text-primary"></i> Wallet</h6>
                <p class="fw-bold mb-0">$ ${walletBalance.toFixed(2)}</p>
            </div>
        </div>
    `;

            // Insert inside profile card before the "Edit profile" button
            const profileCard = document.getElementById("edit-profile-card");
            const editBtn = profileCard.querySelector("a.btn");
            profileCard.insertBefore(walletEarningsDiv, editBtn);
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
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Your session has been terminated after logout.',
            confirmButtonText: 'OK'
        });
    };

}