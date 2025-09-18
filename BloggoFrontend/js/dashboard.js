// ============================
// DOMContentLoaded: Initial Load
// ============================
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    const feedContainer = document.querySelector(".feed");

    if (!token) {
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Please log in to view the dashboard.</p>`;
        return;
    }

    showLoading();

    try {
        // ✅ show top alert only on login
        await Promise.all([
            loadNotifications(true),
            loadPosts(token),
            loadUsers(token),
            loadTags(token),
            loadCurrentUser(token)
        ]);
    } catch (err) {
        console.error("Error loading dashboard:", err);
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Error loading dashboard.</p>`;
    } finally {
        hideLoading();
    }

    setupSearch(token);
});

// ============================
// Top Alert Function
// ============================
function showTopAlert(message, duration = 4000) {
    let alertBox = document.getElementById("top-alert");

    // If not in DOM, create it
    if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "top-alert";
        alertBox.className = "top-alert d-none";
        document.body.appendChild(alertBox);
    }

    alertBox.innerHTML = message; // <-- change here
    alertBox.classList.remove("d-none");

    // Auto hide
    setTimeout(() => {
        alertBox.classList.add("d-none");
    }, duration);
}

async function loadNotifications(showAlert = true) {
    try {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) return;

        const loggedUserId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
        if (!loggedUserId) return;

        const res = await fetch(`http://localhost:8080/api/v1/notification/unread/${loggedUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Failed to load notifications: ${res.status}`);

        const notificationsRes = await res.json();
        const notifications = notificationsRes.data || [];

        if (showAlert) {
            const unread = notifications.filter(n => !n.isRead);
            if (unread.length > 0) {
                showTopAlert(`<i class="fas fa-bell me-2"></i> You have ${unread.length} new notifications!`);
            }
        }



        return notifications;

    } catch (err) {
        console.error("Error loading notifications:", err);
    }
}


// ============================
// Loading Overlay
// ============================
function showLoading(duration = 3600) {
    const loadingEl = document.getElementById("loading");
    if (!loadingEl) return;
    loadingEl.classList.remove("d-none");
    setTimeout(() => loadingEl.classList.add("d-none"), duration);
}

function hideLoading() {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.classList.add("d-none");
}

// ============================
// Load Posts
// ============================
async function loadPosts(token) {
    const feedContainer = document.querySelector(".feed");

    feedContainer.innerHTML = `<div class="text-center w-100">Loading Recent Posts...</div>`;

    try {
        const res = await fetch("http://localhost:8080/api/v1/dashboard/recent-published-posts", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const postsData = await res.json();
        const posts = Array.isArray(postsData.data) ? postsData.data : [];

        feedContainer.innerHTML = posts.length
            ? posts.map(post => `
                <article class="blog-card mb-3 p-3 shadow-sm rounded d-flex gap-3" style="cursor: pointer;" data-id="${post.id}">
                    ${post.imageUrl ? `<div style="width:80px; height:80px; flex-shrink:0; border-radius:8px; overflow:hidden;">
                        <img src="${post.imageUrl}" alt="Cover" style="width:100%; height:100%; object-fit:cover;">
                    </div>` : ''}
                    <div class="flex-grow-1">
                        <h3 class="mb-2" style="font-size: 20px; font-weight: bold">${post.title || "Untitled"}</h3>
                        <p style="font-size: 15px; font-weight: bold">${post.content ? post.content.substring(0, 200) : ""}...</p>
                        <div class="blog-meta d-flex justify-content-between">
                            <span>by ${post.username || "Unknown"}</span>
                            <span>
  <i class="fas fa-rocket me-1 text-black"></i> ${post.boostCount || 0} ·
  <i class="fas fa-comment-alt me-1 text-black"></i> ${post.commentsCount || 0}
</span>

                        </div>
                    </div>
                </article>
            `).join("")
            : `<p class="text-muted">No posts available.</p>`;
    } catch (err) {
        console.error("Load posts error:", err);
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Error loading posts.</p>`;
    }
}

// ============================
// Navigate to Story Detail
// ============================
document.querySelector(".feed").addEventListener("click", (e) => {
    const card = e.target.closest(".blog-card");
    console.log(card)
    if (!card) return;

    // Ignore clicks on buttons
    if (e.target.classList.contains("boost-btn") ||
        e.target.classList.contains("comment-toggle-btn") ||
        e.target.classList.contains("add-comment-btn") ||
        e.target.classList.contains("comment-input")) return;

    const postId = card.dataset.id;
    console.log(postId)
    window.location.href = `story-detail.html?id=${postId}`;
});

// ============================
// Boost Posts
// ============================
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

// ============================
// Comments: Toggle, Load & Add
// ============================
document.querySelector(".feed").addEventListener("click", (e) => {
    // Toggle Comments
    if (e.target.classList.contains("comment-toggle-btn")) {
        const postId = e.target.dataset.id;
        const section = document.getElementById(`comments-${postId}`);
        section.classList.toggle("d-none");
        if (!section.classList.contains("d-none")) {
            loadComments(postId, section.querySelector(".existing-comments"));
        }
    }

    // Add Comment
    if (e.target.classList.contains("add-comment-btn")) {
        addComment(e);
    }
});

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

async function addComment(e) {
    const section = e.target.closest(".comments-section");
    const postId = section.id.split("-")[1];
    const input = section.querySelector(".comment-input");
    const content = input.value.trim();
    if (!content) return;

    const token = sessionStorage.getItem("jwtToken");

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
        loadComments(postId, section.querySelector(".existing-comments"));
    } catch (err) {
        console.error("Add comment failed", err);
    }
}

// ============================
// Load Users
// ============================
async function loadUsers(token) {
    try {
        const loggedUserId =  document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
        const res = await fetch(`http://localhost:8080/user/members?loggedUserId=${loggedUserId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        const users = data.users || data.data || [];

        // Take only the first 10 users
        const firstEightUsers = users.slice(0, 8);

        const userList = document.getElementById("userList");
        if (!userList) return;

        userList.innerHTML = "";
        if (!firstEightUsers.length) {
            userList.innerHTML = `<li class="text-muted">No users found</li>`;
            return;
        }


        firstEightUsers.forEach(u => {
            const li = document.createElement("li");
            li.className = "mb-2";

            // Use default image if profileImage is null or empty
            const profileImage = u.profileImage && u.profileImage.trim() !== ""
                ? u.profileImage
                : "../assets/client1.jpg"; // your default image path

            li.innerHTML = `<a href="members.html?id=${u.id}" class="d-flex align-items-center gap-2">
                        <img src="${profileImage}" alt="${u.username}" 
                             style="width:35px;height:35px;border-radius:50%;object-fit:cover;">
                        <span>${u.username}</span>
                    </a>`;
            userList.appendChild(li);
        });


    } catch (err) {
        console.error("Load users failed", err);
        const userList = document.getElementById("userList");
        if (userList) userList.innerHTML = `<li class="text-danger">Failed to load users</li>`;
    }
}


// ============================
// Load Tags with Pagination
// ============================
let tagOffset = 0;
const tagLimit = 5;

async function loadTags(token) {
    try {
        const res = await fetch(`http://localhost:8080/api/v1/tag?offset=${tagOffset}&limit=${tagLimit}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tags = data.tags || [];
        const tagList = document.getElementById("tagList");
        if (!tagList) return;

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

// ============================
// Load Current User for Avatar
// ============================
async function loadCurrentUser(token) {
    try {
        const res = await fetch("http://localhost:8080/user/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load user");
        const user = await res.json();
        const avatar = document.querySelector(".avatar");
        if (avatar) avatar.src = user.profileImage || "../assets/client1.jpg";
    } catch (err) {
        console.error("Error loading user:", err);
    }
}

// ============================
// Logout
// ============================
function logout() {
    preventBackNavigation();
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    window.location.href = 'signing.html';
}

function preventBackNavigation() {
    window.history.replaceState(null, null, window.location.href);
    window.history.pushState(null, null, window.location.href);

    window.onpopstate = function() {
        window.history.go(1);
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Your session has been terminated after logout.',
            confirmButtonText: 'OK'
        });
    };
}


// ============================
// Search Logic with Load More
// ============================
function setupSearch(token) {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    searchInput.addEventListener("input", async (e) => {
        const keyword = e.target.value.trim();
        if (!keyword) return searchResults.innerHTML = "";

        try {
            const [postsData, usersData, tagsData] = await Promise.all([
                fetchSearch("post", keyword, 5),
                fetchSearch("user", keyword, 5),
                fetchSearch("tag", keyword, 5)
            ]);
            searchResults.innerHTML = renderSearchResults(postsData, usersData, tagsData, keyword);
        } catch (err) {
            console.error(err);
            searchResults.innerHTML = "<p class='text-danger'>Error loading search results</p>";
        }
    });
}

async function fetchSearch(type, keyword, limit = 5) {
    const token = sessionStorage.getItem("jwtToken");
    let url = "";
    switch (type) {
        case "post": url = `/api/v1/post/search/${keyword}?limit=${limit}`; break;
        case "user": url = `/user/search/${keyword}?limit=${limit}`; break;
        case "tag": url = `/api/v1/tag/search/${keyword}?limit=${limit}`; break;
    }
    const res = await fetch(`http://localhost:8080${url}`, { headers: { "Authorization": `Bearer ${token}` } });
    return await res.json();
}

function renderSearchResults(postsData, usersData, tagsData, keyword) {
    let html = `<div class="p-8" style="max-width:600px; margin:0 auto; padding-bottom: 10px;">`;

    console.log("rfrgwrger")
    console.log(postsData.data)

    if (postsData?.data?.length) {
        html += `<h5 class="mt-3"">Posts</h5>`;
        postsData.data.forEach(p => html += `<div class="search-item mb-2">
            <a href="story-detail.html?id=${p.id}" class="fw-bold">${p.title}</a> by <span class="text-muted">${p.username}</span>
        </div>`);
        if (postsData.total > 5) html += `<div class="view-more" onclick="loadAll('post','${keyword}')">View all posts →</div>`;
    }

    if (usersData?.data?.length) {
        html += `<h5 class="mt-3">Users</h5>`;
        usersData.data.forEach(u => html += `<div class="d-flex align-items-center mb-2 search-item">
            <img src="${u.profileImage || '../assets/default.png'}" alt="${u.username}" class="rounded-circle me-2" style="width:30px;height:30px;object-fit:cover;">
            <a href="members-profile.html?userId=${u.userId}">${u.username}</a>
        </div>`);
        if (usersData.total > 5) html += `<div class="view-more" onclick="loadAll('user','${keyword}')">View all users →</div>`;
    }

    if (tagsData?.data?.length) {
        html += `<h5 class="mt-3">Tags</h5>`;
        tagsData.data.forEach(t => html += `<div class="search-item"><a href="tag.html?tagId=${t.tagId}">#${t.name}</a></div>`);
        if (tagsData.total > 5) html += `<div class="view-more" onclick="loadAll('tag','${keyword}')">View all tags →</div>`;
    }

    html += `</div>`;

    return html || "<p class='text-muted'>No results found</p>";
}

// Load all items for a category
async function loadAll(type, keyword) {
    const token = sessionStorage.getItem("jwtToken");
    let url = "";
    switch(type) {
        case "post": url = `/api/v1/post/search/${keyword}`; break;
        case "user": url = `/user/search/${keyword}`; break;
        case "tag": url = `/api/v1/tag/search/${keyword}`; break;
    }

    try {
        const res = await fetch(`http://localhost:8080${url}`, { headers: { "Authorization": `Bearer ${token}` } });
        const data = await res.json();
        console.log("ghvedjhed " + data)
        const container = document.getElementById("searchResults");
        let html = "";

        if(type==="post") html = `<h5>Posts</h5>` + data.data.map(p => `<div class="search-item mb-2">
            <a href="story-detail.html?id=${p.postId}" class="fw-bold">${p.title}</a> by <span class="text-muted">${p.username}</span>
        </div>`).join("");

        if(type==="user") html = `<h5 class="mt-3">Users</h5>` + data.data.map(u => `<div class="d-flex align-items-center mb-2 search-item">
            <img src="${u.profileImage || '../assets/client1.jpg'}" alt="${u.username}" class="rounded-circle me-2" style="width:30px;height:30px;object-fit:cover;">
            <a href="members-profile.html?userId=${u.userId}">${u.username}</a>
        </div>`).join("");

        if(type==="tag") html = `<h5 class="mt-3">Tags</h5>` + data.data.map(t => `<div class="search-item"><a href="tag.html?tagId=${t.tagId}">#${t.name}</a></div>`).join("");

        container.innerHTML = html;
    } catch(err) {
        console.error(err);
        document.getElementById("searchResults").innerHTML = "<p class='text-danger'>Failed to load all results</p>";
    }
}
