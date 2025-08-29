document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const token = sessionStorage.getItem("jwtToken");
    const loggedInUser = sessionStorage.getItem("username");

    if (!postId) return alert("⚠️ Story not found");

    // --- DOM Elements ---
    const titleEl = document.getElementById("storyTitle");
    const authorNameEl = document.getElementById("authorName");
    const authorTitleEl = document.getElementById("authorTitle");
    const authorImageEl = document.getElementById("authorImage");
    const readingTimeEl = document.getElementById("readingTime");
    const viewCountEl = document.getElementById("viewCount");
    const publishDateEl = document.getElementById("publishDate");
    const storyImageEl = document.getElementById("storyImage");
    const contentEl = document.getElementById("storyContent");
    const actionsEl = document.getElementById("story-actions");
    const boostBtn = document.getElementById("boostBtn");
    const boostCountEl = document.getElementById("boostCount");
    const likeBtn = document.getElementById("likeBtn");
    const likeCountEl = document.getElementById("likeCount");
    const commentsList = document.getElementById("commentsList");
    const commentsCountEl = document.getElementById("commentsCount");
    const commentInput = document.getElementById("commentInput");
    const addCommentBtn = document.getElementById("addCommentBtn");
    const bookmarkBtn = document.getElementById("bookmarkBtn");

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

        // Render post
        titleEl.textContent = post.title || "Untitled";
        authorNameEl.textContent = post.username || "Unknown";
        publishDateEl.textContent = new Date(post.publishedAt).toLocaleDateString();

        const wordCount = post.content ? post.content.split(/\s+/).length : 0;
        readingTimeEl.textContent = Math.max(1, Math.round(wordCount / 200));

        contentEl.innerHTML = post.content || "No content available.";
        storyImageEl.src = post.coverPicture || "";

        boostCountEl.textContent = post.boostCount || 0;
        likeCountEl.textContent = post.likeCount || 0;

        // Show Edit/Delete buttons if author
        if (loggedInUser && loggedInUser === post.username) createPostActions();

        // Prefill Edit Modal
        editTitle.value = post.title;
        editContent.value = post.content;

        // Load comments
        await loadComments();

    } catch (err) {
        console.error("Error loading post:", err);
        titleEl.textContent = "⚠️ Error loading story.";
    }

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

    // --- Edit form submission ---
    coverInput.addEventListener("change", () => {
        const file = coverInput.files[0];
        coverPreview.src = file ? URL.createObjectURL(file) : "";
        coverPreview.style.display = file ? "block" : "none";
        if (file) storyImageEl.src = URL.createObjectURL(file);
    });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", editTitle.value);
        formData.append("content", editContent.value);
        if (coverInput.files[0]) formData.append("coverPicture", coverInput.files[0]);

        try {
            const res = await fetch(`http://localhost:8080/api/v1/post/edit/${postId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
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

    // --- Like ---
    let isLiked = false;
    likeBtn.addEventListener("click", async () => {
        try {
            const data = await fetchJSON(`http://localhost:8080/api/v1/like/${postId}`, { method: "POST" });
            isLiked = !isLiked;
            likeCountEl.textContent = data.data;
            toggleClass(likeBtn, "active", isLiked);
            toggleIcon(likeBtn.querySelector("i"), "far", "fas", isLiked);
        } catch (err) { console.error("Like failed:", err); }
    });

    /*// --- Bookmark ---
    let isBookmarked = false;
    bookmarkBtn.addEventListener("click", async () => {
        try {
            await fetchJSON(`http://localhost:8080/api/v1/bookmarks/save/${postId}`, { method: "POST" });
            isBookmarked = !isBookmarked;
            toggleClass(bookmarkBtn, "active", isBookmarked);
            bookmarkBtn.innerHTML = isBookmarked
                ? '<i class="fas fa-bookmark"></i> Saved'
                : '<i class="far fa-bookmark"></i> Save';
        } catch (err) { console.error("Bookmark failed:", err); }
    });*/


    let isBookmarked = false;

// First check if post is already bookmarked
    const checkBookmarkStatus = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/bookmarks/check/${postId}`, {
                headers: {
                    'X-User-Id': userId // You need to get userId from your auth system
                }
            });
            isBookmarked = await response.json();
            updateBookmarkButton();
        } catch (err) {
            console.error("Failed to check bookmark status:", err);
        }
    };

    const updateBookmarkButton = () => {
        toggleClass(bookmarkBtn, "active", isBookmarked);
        bookmarkBtn.innerHTML = isBookmarked
            ? '<i class="fas fa-bookmark"></i> Saved'
            : '<i class="far fa-bookmark"></i> Save';
    };

    bookmarkBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/bookmarks/toggle/${postId}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId
                }
            });

            if (response.ok) {
                isBookmarked = await response.json();
                updateBookmarkButton();
            } else {
                console.error("Bookmark toggle failed");
            }
        } catch (err) {
            console.error("Bookmark failed:", err);
        }
    });

// Initialize bookmark status
    checkBookmarkStatus();



    // --- Add Comment ---
    addCommentBtn.addEventListener("click", async () => {
        const content = commentInput.value.trim();
        if (!content) return;
        try {
            await fetchJSON(`http://localhost:8080/api/v1/comment/${postId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
            });
            commentInput.value = "";
            await loadComments();
        } catch (err) { console.error("Add comment failed:", err); }
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
                            <div class="comment-actions">
                                <a class="comment-action like-comment"><i class="far fa-heart"></i> <span>${c.likes || 0}</span></a>
                                <a class="comment-action reply-comment">Reply</a>
                            </div>
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
