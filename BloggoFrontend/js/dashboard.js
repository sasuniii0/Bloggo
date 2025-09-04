document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    const feedContainer = document.querySelector(".feed");

    if (!token) {
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Please log in to view the dashboard.</p>`;
        return;
    }

    // Load posts, users, and tags simultaneously
    + await Promise.all([loadPosts(token), loadUsers(token), loadTags()]);
});

// ========================
// Load Posts
// ========================
async function loadPosts(token) {
    const feedContainer = document.querySelector(".feed");

    try {
        const postsRes = await fetch("http://localhost:8080/api/v1/dashboard/all-posts", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!postsRes.ok) throw new Error("Failed to fetch posts");
        const postsData = await postsRes.json();
        const posts = Array.isArray(postsData.data) ? postsData.data : [];

        feedContainer.innerHTML = posts.length
            ? posts.map(post => `
        <article class="blog-card mb-3 p-3 shadow-sm rounded d-flex gap-3" style="cursor: pointer;" data-id="${post.id}">
            
            ${post.imageUrl ? `
            <!-- Cover image square -->
            <div style="width:80px; height:80px; flex-shrink:0; border-radius:8px; overflow:hidden;">
                <img src="${post.imageUrl}" alt="Cover" style="width:100%; height:100%; object-fit:cover;">
            </div>
            ` : ''}

            <div class="flex-grow-1">
                <h3 class="mb-2" style="font-size: 20px; font-weight: bold">${post.title || "Untitled"}</h3>
                <p style="font-size: 15px; font-weight: bold">${post.content ? post.content.substring(0, 200) : ""}...</p>
                <div class="blog-meta d-flex justify-content-between">
                    <span>by ${post.username || "Unknown"}</span>
                    <span>🚀 ${post.boostCount || 0} · 💬 ${post.commentsCount || 0}</span>
                </div>

                <div class="blog-actions mt-2 d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-success boost-btn" data-id="${post.id}">
                        🚀 Boost (${post.boostCount || 0})
                    </button>
                    <button class="btn btn-sm btn-outline-primary comment-toggle-btn" data-id="${post.id}">
                        💬 Comments
                    </button>
                </div>

                <div class="comments-section mt-2 d-none" id="comments-${post.id}">
                    <div class="existing-comments mb-2"></div>
                    <div class="input-group">
                        <input type="text" class="form-control comment-input" placeholder="Write a comment...">
                        <button class="btn btn-primary add-comment-btn">Send</button>
                    </div>
                </div>
            </div>
        </article>
    `).join("")
            : `<p class="text-muted">No posts available.</p>`;

    } catch (err) {
        console.error("Dashboard error:", err);
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Error loading dashboard.</p>`;
    }
}

// ========================
// Navigate to Story Detail
// ========================
document.querySelector(".feed").addEventListener("click", (e) => {
    const card = e.target.closest(".blog-card");

    // ignore clicks on buttons
    if (e.target.classList.contains("boost-btn") ||
        e.target.classList.contains("comment-toggle-btn") ||
        e.target.classList.contains("add-comment-btn") ||
        e.target.classList.contains("comment-input")) return;

    if (card) {
        const postId = card.dataset.id;
        window.location.href = `story-detail.html?id=${postId}`;
    }
});

// ========================
// Boost
// ========================
document.querySelector(".feed").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("boost-btn")) return;
    const postId = e.target.dataset.id;
    const token = sessionStorage.getItem("jwtToken");

    try {
        const res = await fetch(`http://localhost:8080/api/v1/boost/${postId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await res.json();
        e.target.textContent = `🚀 Boost (${data.data})`;
    } catch (err) {
        console.error("Boost failed", err);
    }
});

// ========================
// Toggle Comments
// ========================
document.querySelector(".feed").addEventListener("click", (e) => {
    if (!e.target.classList.contains("comment-toggle-btn")) return;
    const postId = e.target.dataset.id;
    const section = document.getElementById(`comments-${postId}`);
    section.classList.toggle("d-none");

    if (!section.classList.contains("d-none")) {
        loadComments(postId, section.querySelector(".existing-comments"));
    }
});

// ========================
// Add Comment
// ========================
document.querySelector(".feed").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("add-comment-btn")) return;

    const postId = e.target.closest(".comments-section").id.split("-")[1];
    const input = e.target.closest(".comments-section").querySelector(".comment-input");
    const content = input.value.trim();
    const token = sessionStorage.getItem("jwtToken");
    if (!content) return;

    try {
        await fetch(`http://localhost:8080/api/v1/comment/${postId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(content)
        });
        input.value = "";
        loadComments(postId, e.target.closest(".comments-section").querySelector(".existing-comments"));
    } catch (err) {
        console.error("Add comment failed", err);
    }
});

// ========================
// Load Comments
// ========================
async function loadComments(postId, container) {
    try {
        const res = await fetch(`http://localhost:8080/api/v1/comment/${postId}`);
        const data = await res.json();
        container.innerHTML = data.data.length
            ? data.data.map(c => `<div class="p-2 mb-1 rounded shadow-sm bg-light"><strong>${c.userId}:</strong> ${c.content}</div>`).join("")
            : "<div class='text-muted'>No comments yet</div>";
    } catch (err) {
        console.error("Load comments failed", err);
    }
}

async function loadUsers() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return console.error("No JWT token found");

    try {
        const res = await fetch("http://localhost:8080/user?offset=0&limit=6", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("Users API response:", data);

        // Adjust this depending on your API
        const users = data.users || data.data || [];

        const userList = document.getElementById("userList");
        if (!userList) throw new Error("Element with id 'userList' not found");

        userList.innerHTML = ""; // clear previous content

        if (users.length === 0) {
            userList.innerHTML = `<li class="text-muted">No users found</li>`;
            return;
        }

        users.forEach(user => {
            const li = document.createElement("li");
            li.className = "mb-2";
            li.innerHTML = `
                <a href="profile.html?id=${user.id}" class="d-flex align-items-center gap-2">
                    ${user.profileImage ? `<img src="${user.profileImage}" alt="${user.username}" 
                    style="width:35px; height:35px; border-radius:50%; object-fit:cover;">` : ''}
                    <span>${user.username}</span>
                </a>
            `;
            userList.appendChild(li);
        });

    } catch (err) {
        console.error("Load users failed", err);
        const userList = document.getElementById("userList");
        if (userList) userList.innerHTML = `<li class="text-danger">Failed to load users</li>`;
    }
}


// Load Tags
let tagOffset = 0;
const tagLimit = 5;

async function loadTags() {
    try {
        const res = await fetch(`http://localhost:8080/api/v1/tag?offset=${tagOffset}&limit=${tagLimit}`);
        const data = await res.json();
        const tags = data.tags || []; // <-- matches your endpoint response
        const tagList = document.getElementById("tagList");

        tags.forEach(tag => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="tag.html?name=${tag.name}" class="tag-link">#${tag.name}</a>`;
            tagList.appendChild(li);
        });

        tagOffset += tagLimit;
        if (tags.length < tagLimit) document.getElementById("loadMoreTags").style.display = "none";
    } catch (err) {
        console.error("Load tags failed", err);
    }
}
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

        // Top navbar avatar
        document.querySelector(".avatar").src = user.profileImage || "../assets/default.png";
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
    window.onpopstate = function() {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}

function showLoading() {
    document.getElementById("loading").classList.remove("d-none");
}

function hideLoading() {
    document.getElementById("loading").classList.add("d-none");
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    const feedContainer = document.querySelector(".feed");

    if (!token) {
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Please log in to view the dashboard.</p>`;
        return;
    }

    showLoading(); // Show loading overlay

    try {
        // Load posts, users, and tags simultaneously
        await Promise.all([loadPosts(token), loadUsers(token), loadTags()]);
    } catch (err) {
        console.error("Error loading dashboard:", err);
    } finally {
        hideLoading(); // Hide loading overlay
    }
});
