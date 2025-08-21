const api = "https://localhost:8080/user";

/* ------------------ USERS ------------------ */
let users = [
    { id: 1, username: "alex", email: "alex@mail.com", role: "USER", status: "FREE" },
    { id: 2, username: "maria", email: "maria@mail.com", role: "ADMIN", status: "PAID" }
];
let editingId = null;

function renderUsers() {
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";
    users.forEach(user => {
        tbody.innerHTML += `
        <tr>
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${user.status}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="openEditUserModal(${user.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">Delete</button>
          </td>
        </tr>`;
    });
}

function openAddUserModal() {
    editingId = null;
    document.getElementById("userForm").reset();
    document.getElementById("userModalTitle").innerText = "Add User";
}

function openEditUserModal(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    editingId = id;
    document.getElementById("userId").value = user.id;
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("role").value = user.role;
    document.getElementById("status").value = user.status;
    document.getElementById("userModalTitle").innerText = "Edit User";
    new bootstrap.Modal(document.getElementById("userModal")).show();
}

function saveUser(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const status = document.getElementById("status").value;

    if (editingId) {
        const user = users.find(u => u.id === editingId);
        Object.assign(user, { username, email, role, status });
    } else {
        const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push({ id: newId, username, email, role, status });
    }

    renderUsers();
    bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
}

function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        users = users.filter(u => u.id !== id);
        renderUsers();
    }
}

/* ------------------ ADMIN ACTIONS ------------------ */
let actions = [
    { id: 1, name: "BAN", targetUser: "alex", date: "2025-08-21" },
    { id: 2, name: "PROMOTE", targetUser: "maria", date: "2025-08-20" }
];
let editingActionId = null;

function renderActions() {
    const tbody = document.getElementById("actionTableBody");
    tbody.innerHTML = "";
    actions.forEach(action => {
        tbody.innerHTML += `
        <tr>
          <td>${action.id}</td>
          <td>${action.name}</td>
          <td>${action.targetUser}</td>
          <td>${action.date}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="openEditActionModal(${action.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteAction(${action.id})">Delete</button>
          </td>
        </tr>`;
    });
}

function openAddActionModal() {
    editingActionId = null;
    document.getElementById("actionForm").reset();
    document.getElementById("actionModalTitle").innerText = "Add Admin Action";
}

function openEditActionModal(id) {
    const action = actions.find(a => a.id === id);
    if (!action) return;
    editingActionId = id;
    document.getElementById("actionId").value = action.id;
    document.getElementById("actionName").value = action.name;
    document.getElementById("targetUser").value = action.targetUser;
    document.getElementById("actionDate").value = action.date;
    document.getElementById("actionModalTitle").innerText = "Edit Admin Action";
    new bootstrap.Modal(document.getElementById("actionModal")).show();
}

function saveAction(event) {
    event.preventDefault();
    const name = document.getElementById("actionName").value;
    const targetUser = document.getElementById("targetUser").value;
    const date = document.getElementById("actionDate").value;

    if (editingActionId) {
        const action = actions.find(a => a.id === editingActionId);
        Object.assign(action, { name, targetUser, date });
    } else {
        const newId = actions.length ? Math.max(...actions.map(a => a.id)) + 1 : 1;
        actions.push({ id: newId, name, targetUser, date });
    }

    renderActions();
    bootstrap.Modal.getInstance(document.getElementById("actionModal")).hide();
}

function deleteAction(id) {
    if (confirm("Are you sure you want to delete this action?")) {
        actions = actions.filter(a => a.id !== id);
        renderActions();
    }
}

/* Initial Render */
renderUsers();
renderActions();