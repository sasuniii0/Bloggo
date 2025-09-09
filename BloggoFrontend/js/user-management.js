const userEndpoint = "http://localhost:8080/user/getAll-pagination";
let allUsers = [];
let currentPage = 1;
const pageSize = 5;

// Get JWT token
function getToken() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        alert("You are not logged in! Redirecting...");
        window.location.href = "signing.html";
    }
    return token;
}

// Load all users once
async function loadAllUsers() {
    const token = getToken();
    try {
        const res = await fetch(`${userEndpoint}?page=0&size=1000`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        const data = await res.json();
        allUsers = data?.data?.content || [];
        renderPage(1); // render first page
    } catch (err) {
        console.error("Error loading users:", err);
        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error fetching users</td></tr>`;
    }
}

// Render a specific page from filtered users
function renderPage(page) {
    currentPage = page;
    const tbody = document.getElementById("userTableBody");
    const pagination = document.getElementById("pagination");
    const query = document.getElementById("userSearch").value.toLowerCase();

    // Filter users based on search
    const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.role || "").toLowerCase().includes(query)
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageUsers = filteredUsers.slice(start, end);

    // Render table
    tbody.innerHTML = pageUsers.length === 0
        ? `<tr><td colspan="5" class="text-center">No users found</td></tr>`
        : "";

    pageUsers.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role || '-'}</td>
                <td>
                    <span class="badge ${user.action?.actionType === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}"
                          onclick="toggleStatus(${user.id}, this)">
                        ${user.action?.actionType || 'INACTIVE'}
                    </span>
                </td>
            </tr>
        `;
    });

    // Render pagination
    renderPagination(totalPages);
}

// Render frontend pagination buttons
function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = e => {
            e.preventDefault();
            renderPage(i);
        };
        pagination.appendChild(li);
    }
}

// Toggle user status (ACTIVE / INACTIVE)
async function toggleStatus(userId, badge) {
    const token = getToken();
    const adminUsername = sessionStorage.getItem("username") || "admin";

    try {
        const res = await fetch(`http://localhost:8080/api/v1/admin-actions/status/${userId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `adminUsername=${encodeURIComponent(adminUsername)}`
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        const newStatus = data?.data?.actionType || 'INACTIVE';
        badge.textContent = newStatus;
        badge.className = "badge " + (newStatus === "ACTIVE" ? "bg-success" : "bg-secondary");

    } catch (err) {
        console.error("Toggle status error:", err);
        alert("Failed to toggle status. Check console for details.");
    }
}

// Search input listener
document.getElementById("userSearch").addEventListener("keyup", () => {
    renderPage(1); // Always reset to page 1 after search
});

// Load all users when DOM is ready
document.addEventListener("DOMContentLoaded", () => loadAllUsers());
