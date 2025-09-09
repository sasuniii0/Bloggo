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
    const user = sessionStorage.getItem("userId");
    if (!user) {
        alert("No userId found, please sign in again.");
        window.location.href = "signing.html";
    }
    return user;
}

document.addEventListener("DOMContentLoaded", () => {
    loadNotifications();
});

// Load notifications for logged-in user
// Load notifications for logged-in user
async function loadNotifications() {
    const token = getToken();
    const userId = getUserId();
    const allTab = document.getElementById("all");

    allTab.innerHTML = `<div class="text-center w-100">Loading notifications...</div>`;

    try {
        const res = await fetch(`${notificationEndPoint}/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const apiResponse = await res.json();
        console.log("Fetched API response:", apiResponse);

        const notifications = apiResponse.data; // ✅ take notifications from .data

        if (!notifications || notifications.length === 0) {
            allTab.innerHTML = `<div class="text-center text-muted">No notifications found</div>`;
            return;
        }

        allTab.innerHTML = "";
        notifications.forEach(n => {
            const item = document.createElement("div");
            item.className = "card mb-2 shadow-sm";
            item.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fw-bold">${n.type}</span><br>
                        <span>${n.message}</span>
                        <div class="text-muted small">${new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    ${n.isRead
                ? '<span class="badge bg-secondary">Read</span>'
                : '<span class="badge bg-primary">New</span>'}
                </div>
            `;
            allTab.appendChild(item);
        });

    } catch (err) {
        console.error("Error loading notifications:", err);
        allTab.innerHTML = `<div class="text-center text-danger">Error fetching notifications</div>`;
    }
}

