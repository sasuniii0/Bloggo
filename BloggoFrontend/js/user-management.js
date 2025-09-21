const userEndpoint = "http://localhost:8080/user/getAll-pagination";
const memberEndpoint = "http://localhost:8080/user/member/wallet";

let allUsers = [];
let allMembers = [];
let currentPage = 1;
let currentMemberPage = 1;
const pageSize = 5;
const memberPageSize = 5;

// ✅ Get JWT token
function getToken() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Not Logged In',
            text: 'You are not logged in! Redirecting...',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = "signing.html";
        });
    }
    return token;
}

// ========================== USERS TABLE ==========================
async function loadAllUsers() {
    const token = getToken();
    try {
        const res = await fetch(`${userEndpoint}?page=0&size=1000`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        allUsers = data?.data?.content || [];
        renderPage(1);
    } catch (err) {
        console.error("Error loading users:", err);
        document.getElementById("userTableBody").innerHTML =
            `<tr><td colspan="5" class="text-center text-danger">Error fetching users</td></tr>`;
    }
}

function renderPage(page) {
    currentPage = page;
    const tbody = document.getElementById("userTableBody");
    const query = document.getElementById("userSearch").value.toLowerCase();

    const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.role || "").toLowerCase().includes(query)
    );

    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageUsers = filteredUsers.slice(start, end);

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

    renderPagination(totalPages, "pagination", renderPage);
}

// ========================== MEMBERS TABLE ==========================
async function loadAllMembers() {
    const token = getToken();
    try {
        const res = await fetch(`${memberEndpoint}?page=0&size=1000`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        allMembers = data?.data || [];
        renderMemberPage(1);
    } catch (err) {
        console.error("Error loading members:", err);
        document.getElementById("memberWalletTableBody").innerHTML =
            `<tr><td colspan="4" class="text-center text-danger">Error fetching members</td></tr>`;
    }
}

function renderMemberPage(page) {
    currentMemberPage = page;
    const tbody = document.getElementById("memberWalletTableBody");

    const totalPages = Math.ceil(allMembers.length / memberPageSize);
    const start = (page - 1) * memberPageSize;
    const end = start + memberPageSize;
    const pageMembers = allMembers.slice(start, end);

    tbody.innerHTML = pageMembers.length === 0
        ? `<tr><td colspan="4" class="text-center">No members found</td></tr>`
        : "";

    pageMembers.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.id}</td>
                <td>${m.username}</td>
                <td>${m.email}</td>
                <td><span class="fw-bold text-success">$${m.balance?.toFixed(2) || 0}</span></td>
            </tr>
        `;
    });

    renderPagination(totalPages, "memberPagination", renderMemberPage);
}

// ========================== PAGINATION (shared) ==========================
function renderPagination(totalPages, elementId, renderFunc) {
    const pagination = document.getElementById(elementId);
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === (elementId === "pagination" ? currentPage : currentMemberPage) ? "active" : ""}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = e => {
            e.preventDefault();
            renderFunc(i);
        };
        pagination.appendChild(li);
    }
}

// ========================== TOGGLE USER STATUS ==========================
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

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        const newStatus = data?.data?.actionType || 'INACTIVE';
        badge.textContent = newStatus;
        badge.className = "badge " + (newStatus === "ACTIVE" ? "bg-success" : "bg-secondary");

    } catch (err) {
        console.error("Toggle status error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Action Failed',
            text: 'Failed to toggle status. Check console for details.',
            confirmButtonText: 'OK'
        });
    }
}

// ========================== DOM LOAD ==========================
document.addEventListener("DOMContentLoaded", () => {
    loadAllUsers();
    loadAllMembers();
});

document.getElementById("userSearch").addEventListener("keyup", () => {
    renderPage(1);
});
