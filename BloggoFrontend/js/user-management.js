    const userEndpoint = "http://localhost:8080/user/getAll-pagination";
    let currentPage = 1;
    const pageSize = 5;

    // Get JWT token from sessionStorage
    function getToken() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
    alert("You are not logged in! Redirecting...");
    window.location.href = "signing.html";
}
    return token;
}

    // Load users from backend
    async function loadUsers(page = 1) {
    currentPage = page;
    const token = getToken();
    const tbody = document.getElementById("userTableBody");
    const pagination = document.getElementById("pagination");

    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading...</td></tr>`;
    pagination.innerHTML = "";

    try {
    const res = await fetch(`${userEndpoint}?page=${page - 1}&size=${pageSize}`, {
    headers: { "Authorization": `Bearer ${token}` }
});

    if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
}

    const data = await res.json();
    console.log("Fetched data:", data);

    const users = data?.data?.content || [];
    const totalPages = data?.data?.totalPages || 1;

    if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No users found</td></tr>`;
    renderPagination(0);
    return;
}

    tbody.innerHTML = "";
    users.forEach(user => {
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

    renderPagination(totalPages);

} catch (err) {
    console.error("Error loading users:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error fetching users</td></tr>`;
}
}

    // Render pagination buttons
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
    loadUsers(i);
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
    console.log("Toggle response:", data);

    const newStatus = data?.data?.actionType || 'INACTIVE';
    badge.textContent = newStatus;
    badge.className = "badge " + (newStatus === "ACTIVE" ? "bg-success" : "bg-secondary");

} catch (err) {
    console.error("Toggle status error:", err);
    alert("Failed to toggle status. Check console for details.");
}
}

    // Load users when DOM is ready
    document.addEventListener("DOMContentLoaded", () => loadUsers(currentPage));
