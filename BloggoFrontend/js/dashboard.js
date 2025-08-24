document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    const feedContainer = document.querySelector(".feed");

    if (!token) {
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Please log in to view the dashboard.</p>`;
        return;
    }

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
                <article class="blog-card mb-3 p-3 shadow-sm rounded">
                    <h3>${post.title || "Untitled"}</h3>
                    <p>${post.content ? post.content.substring(0, 200) : ""}...</p>
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
                </article>
            `).join("")
            : `<p class="text-muted">No posts available.</p>`;

    } catch (err) {
        console.error("Dashboard error:", err);
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Error loading dashboard.</p>`;
    }
});

// ========================
// Boost
// ========================
document.querySelector(".feed").addEventListener("click", async (e) => {
    if (e.target.classList.contains("boost-btn")) {
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
    }
});

// ========================
// Toggle Comments Section
// ========================
document.querySelector(".feed").addEventListener("click", (e) => {
    if (e.target.classList.contains("comment-toggle-btn")) {
        const postId = e.target.dataset.id;
        const section = document.getElementById(`comments-${postId}`);
        section.classList.toggle("d-none");

        if (!section.classList.contains("d-none")) {
            loadComments(postId, section.querySelector(".existing-comments"));
        }
    }
});

// ========================
// Add Comment
// ========================
document.querySelector(".feed").addEventListener("click", async (e) => {
    if (e.target.classList.contains("add-comment-btn")) {
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
            ? data.data.map(c => `<div class="p-2 mb-1 rounded shadow-sm bg-light"><strong>${c.username}:</strong> ${c.content}</div>`).join("")
            : "<div class='text-muted'>No comments yet</div>";
    } catch (err) {
        console.error("Load comments failed", err);
    }
}
