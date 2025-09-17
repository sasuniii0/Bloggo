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
    window.onpopstate = function() {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}

const notificationEndPoint = "http://localhost:8080/api/v1/notification";

function getToken() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        alert("No JWT token found, please sign in again.");
        window.location.href = "signing.html";
    }
    return token;
}

function getUserId() {
    const user = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
    if (!user) {
        alert("No userId found, please sign in again.");
        window.location.href = "signing.html";
    }
    return user;
}

async function getFollowing() {
    const token = getToken();
    const userId = getUserId();

    try {
        // Step 1: get the list of following user IDs
        const res = await fetch(`http://localhost:8080/api/v1/follows/getFollowing?userId=${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const apiResponse = await res.json();

        if (!res.ok || apiResponse.status !== 200) {
            console.error("Failed to load following list");
            alert("Could not load following list");
            return;
        }

        const followingList = apiResponse.data || []; // [{followedId: 18}, {followedId: 25}, ...]

        // Step 2: fetch user details for each followedId
        const usersWithDetails = await Promise.all(
            followingList.map(async f => {
                const userRes = await fetch(`http://localhost:8080/api/v1/follows/getFollwingDetails?userId=${f.followedId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!userRes.ok) return null;
                const userApiResponse = await userRes.json();
                return userApiResponse.data; // should return { userId, username, profileImage }
            })
        );

        // Step 3: render
        const ulEl = document.querySelector(".following-list");
        if (!ulEl) return;

        ulEl.innerHTML = "";

        usersWithDetails.forEach(user => {
            if (!user) return;
            const li = document.createElement("li");
            li.className = "d-flex align-items-center mb-2";

            li.innerHTML = `
                <img src="${user.profileImage || '../assets/client1.jpg'}" class="rounded-circle me-2" width="35" height="35" alt="${user.username}">
                <span>${user.username}</span>
            `;

            ulEl.appendChild(li);
        });

        const seeAllLi = document.createElement("li");
        seeAllLi.innerHTML = `<a href="follow.html" class="text-decoration-none">See all (${usersWithDetails.length})</a>`;
        ulEl.appendChild(seeAllLi);

    } catch (err) {
        console.error(err);
        alert("Could not load following list. Try again.");
    }
}

// Call on page load
document.addEventListener("DOMContentLoaded", () => {
    getFollowing();
    loadNotifications();
});

async function loadNotifications() {
    const token = getToken();
    const userId = getUserId();
    const allTab = document.getElementById("all");

    allTab.innerHTML = `<div class="text-center w-100">Loading notifications...</div>`;

    try {
        const res = await fetch(`${notificationEndPoint}/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

        const apiResponse = await res.json();
        const notifications = apiResponse.data;
        console.log(notifications)

        if (!notifications || notifications.length === 0) {
            allTab.innerHTML = `<div class="text-center text-muted">No notifications found</div>`;
            return;
        }

        allTab.innerHTML = "";
        notifications.forEach(n => {
            const item = document.createElement("div");
            item.className = "card mb-2 shadow-sm";
            item.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center" data-id="${n.id}">
                    <div>
                        <span class="fw-bold">${n.type}</span><br>
                        <span>${n.message}</span>
                        <div class="text-muted small">${new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    ${n.read
                ? '<span class="badge bg-secondary">Read</span>'
                : '<span class="badge badge-new">New</span>'}
                </div>
            `;
            allTab.appendChild(item);

            // Mark as read when clicked if unread
            if (!n.isRead) {
                item.addEventListener("click", async () => {
                    try {
                        await fetch(`${notificationEndPoint}/read/${n.id}`, {
                            method: "PUT",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });

                        // Update badge visually
                        const badge = item.querySelector(".badge");
                        badge.className = "badge bg-secondary";
                        badge.textContent = "Read";

                        n.isRead = true; // update local object

                    } catch (err) {
                        console.error("Error marking notification as read:", err);
                    }
                });
            }
        });

    } catch (err) {
        console.error("Error loading notifications:", err);
        allTab.innerHTML = `<div class="text-center text-danger">Error fetching notifications</div>`;
    }
}
