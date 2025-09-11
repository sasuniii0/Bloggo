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

document.addEventListener("DOMContentLoaded", () => {
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
                    ${n.isRead
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
