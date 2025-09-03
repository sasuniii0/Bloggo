const api = "http://localhost:8080/user";

let users = [];
let editingId = null;

// Fetch all users from the API
async function fetchUsers() {
    try {
        const res = await fetch(`${api}/getAll`);
        const data = await res.json();
        users = data.data; // Assuming ApiResponseDTO.data contains users
        renderUsers();
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Render users with optional filtered list
function renderUsers(list = users) {
    const tbody = document.getElementById("userTableBody");
    console.log("Rendering users:", list);
    tbody.innerHTML = "";
    list.forEach(user => {
        tbody.innerHTML += `
        <tr>
          <td>${user.userId}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${user.membershipStatus}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="openEditUserModal(${user.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">Delete</button>
          </td>
        </tr>`;
    });
}

// Search filter
function searchUsers() {
    const query = document.getElementById("userSearch").value.toLowerCase();
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
    renderUsers(filteredUsers);
}

// Save (Add/Edit) user
async function saveUser(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const status = document.getElementById("status").value;

    const payload = { id: editingId, username, email, role, status };

    try {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            alert('You must be logged in to perform this action.');
            return;
        }
        let url = editingId ? `${api}/edit` : `${api}/save`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(data.message);

        // Refresh user list
        fetchUsers();
        bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
    } catch (error) {
        console.error("Error saving user:", error);
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
        const res = await fetch(`${api}/delete?userId=${id}`, { method: "DELETE" });
        const data = await res.json();
        console.log(data.message);
        fetchUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Open edit modal
function openEditUserModal(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    editingId = id;
    document.getElementById("userId").value = user.userId;
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("role").value = user.role;
    document.getElementById("status").value = user.membershipStatus;
    document.getElementById("userModalTitle").innerText = "Edit User";
    new bootstrap.Modal(document.getElementById("userModal")).show();
}

// Open add modal
function openAddUserModal() {
    editingId = null;
    document.getElementById("userForm").reset();
    document.getElementById("userModalTitle").innerText = "Add User";
}

// Initial fetch
fetchUsers();

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