document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const token = sessionStorage.getItem("jwtToken");
    const loggedInUser = sessionStorage.getItem("username");

    if (!postId) return alert("⚠️ Story not found");

    // --- DOM Elements ---
    const titleEl = document.getElementById("storyTitle");
    const authorNameEl = document.getElementById("authorName");
    const publishDateEl = document.getElementById("publishDate");
    const storyImageEl = document.getElementById("storyImage");
    const contentEl = document.getElementById("storyContent");
    const actionsEl = document.getElementById("story-actions");
    const boostBtn = document.getElementById("boostBtn");
    const boostCountEl = document.getElementById("boostCount");
    const commentsList = document.getElementById("commentsList");
    const commentsCountEl = document.getElementById("commentsCount");

    const editForm = document.getElementById("editForm");
    const editTitle = document.getElementById("editTitle");
    const editContent = document.getElementById("editContent");
    const coverInput = document.getElementById("coverPicture");
    const coverPreview = document.getElementById("coverPreview");

    if (!token) {
        titleEl.textContent = "⚠️ Please log in to view the story.";
        return;
    }

    // --- Utility: Fetch JSON with Auth ---
    const fetchJSON = async (url, options = {}) => {
        options.headers = options.headers || {};
        if (!options.headers["Authorization"]) options.headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(url, options);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw data;
        return data;
    };

    // --- Load Post ---
    let currentPost = null;
    try {
        const data = await fetchJSON(`http://localhost:8080/api/v1/dashboard/post/${postId}`);
        const post = data.data;
        currentPost = post;

        console.log(post);

        // Render post
        titleEl.textContent = post.title || "Untitled";
        authorNameEl.textContent = post.username || "Unknown";
        publishDateEl.textContent = new Date(post.publishedAt).toLocaleDateString();
        contentEl.innerHTML = post.content || "No content available.";
        boostCountEl.textContent = post.boostCount || 0;

        // Show Edit/Delete buttons if author
        if (loggedInUser && loggedInUser === post.username) createPostActions();

        // Prefill Edit Modal
        editTitle.value = post.title;
        editContent.value = post.content;

// const coverUrl = post.coverImageUrl || "";

        const coverUrl = post.imageUrl || "";
        storyImageEl.src = coverUrl;
        coverPreview.src = coverUrl;
        coverPreview.style.display = coverUrl ? "block" : "none";


        // Load comments
        await loadComments();
    } catch (err) {
        console.error("Error loading post:", err);
        titleEl.textContent = "⚠️ Error loading story.";
    }

// --- Cover Input Preview ---
    coverInput.addEventListener("change", () => {
        const file = coverInput.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            coverPreview.src = previewUrl;
            coverPreview.style.display = "block";
            storyImageEl.src = previewUrl;
        } else {
            coverPreview.src = currentPost.coverImageUrl || "";
            coverPreview.style.display = currentPost.coverImageUrl ? "block" : "none";
            storyImageEl.src = currentPost.coverImageUrl || "";
        }
    });


    // --- Create Edit/Delete buttons ---
    function createPostActions() {
        const editBtn = document.createElement("button");
        editBtn.className = "action-btn edit-btn";
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.setAttribute("data-bs-toggle", "modal");
        editBtn.setAttribute("data-bs-target", "#editModal");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "action-btn delete-btn";
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = async () => {
            if (!confirm("Are you sure you want to delete this post?")) return;
            try {
                await fetchJSON(`http://localhost:8080/api/v1/post/delete/${postId}`, { method: "DELETE" });
                alert("✅ Post deleted successfully!");
                window.location.href = "dashboard.html";
            } catch (err) {
                alert(`❌ ${err.message || "Failed to delete post"}`);
            }
        };

        actionsEl.append(editBtn, deleteBtn);
    }

    // --- Cover Image Preview ---
    coverInput.addEventListener("change", () => {
        const file = coverInput.files[0];
        coverPreview.src = file ? URL.createObjectURL(file) : "";
        coverPreview.style.display = file ? "block" : "none";
        if (file) storyImageEl.src = URL.createObjectURL(file);
    });

    // --- Edit Form Submission ---
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Determine cover image
        let coverImageUrl = currentPost.coverPicture;
        const file = coverInput.files[0];

        if (file) {
            coverImageUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = err => reject(err);
                reader.readAsDataURL(file);
            });
        }

        const payload = {
            title: editTitle.value,
            content: editContent.value,
            coverImageUrl
        };

        try {
            const res = await fetch(`http://localhost:8080/api/v1/post/edit/${postId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("✅ Post updated successfully!");
                location.reload();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`❌ ${errData.message || res.status}`);
            }
        } catch (err) {
            console.error("Edit failed:", err);
            alert("⚠️ Error updating post");
        }
    });

    // --- Boost ---
    boostBtn.addEventListener("click", async () => {
        try {
            const data = await fetchJSON(`http://localhost:8080/api/v1/boost/${postId}`, { method: "POST" });
            boostCountEl.textContent = data.data;
            boostBtn.classList.add("active");
            boostBtn.disabled = true;
        } catch (err) { console.error("Boost failed:", err); }
    });

    // --- Load Comments ---
    async function loadComments() {
        try {
            const data = await fetch(`http://localhost:8080/api/v1/comment/${postId}`).then(r => r.json());
            const comments = data.data || [];
            commentsCountEl.textContent = comments.length;
            commentsList.innerHTML = comments.length
                ? comments.map(c => `
                    <div class="comment">
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80">
                        <div class="comment-content">
                            <div class="comment-header">
                                <div class="fw-semibold">${c.userId || 'Anonymous'}</div>
                                <div class="small text-light">${new Date(c.createdAt).toLocaleDateString()}</div>
                            </div>
                            <p>${c.content}</p>
                        </div>
                    </div>
                `).join("")
                : "<div class='text-center py-3 text-muted'>No comments yet.</div>";
        } catch (err) {
            console.error("Load comments failed:", err);
            commentsList.innerHTML = "<div class='text-center py-3 text-muted'>Error loading comments</div>";
        }
    }

    // --- Helper functions ---
    function toggleClass(el, className, condition) {
        if (condition) el.classList.add(className);
        else el.classList.remove(className);
    }

    function toggleIcon(el, removeClass, addClass, condition) {
        if (condition) el.classList.replace(removeClass, addClass);
        else el.classList.replace(addClass, removeClass);
    }
});

function logout() {
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Redirect to login page
    window.location.href = 'login.html';
}