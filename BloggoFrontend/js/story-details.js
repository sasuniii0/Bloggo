document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const token = sessionStorage.getItem("jwtToken");

    if (!postId) return;

    const titleEl = document.querySelector("h1");
    const authorEl = document.querySelector(".text-muted strong");
    const dateEl = document.querySelector(".text-muted");
    const contentEl = document.querySelector("main p:last-of-type");
    const actionsEl = document.getElementById("story-actions");

    const boostBtn = document.getElementById("boostBtn");
    const commentsList = document.getElementById("commentsList");
    const commentInput = document.getElementById("commentInput");
    const addCommentBtn = document.getElementById("addCommentBtn");

    if (!token) {
        titleEl.textContent = "⚠️ Please log in to view the story.";
        return;
    }

    let currentPost = null;

    try {
        // ========================
        // Fetch Post
        // ========================
        const res = await fetch(`http://localhost:8080/api/v1/dashboard/post/${postId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch post");

        const data = await res.json();
        const post = data.data;
        console.log(post)
        currentPost = post;

        // Render post
        titleEl.textContent = post.title || "Untitled";
        authorEl.textContent = post.username || "Unknown";
        dateEl.innerHTML = `By <strong>${post.username || "Unknown"}</strong> · ${new Date(post.publishedAt).toLocaleDateString()}`;

        const plainText = post.content ? post.content.replace(/<[^>]+>/g, '') : "No content available.";
        contentEl.textContent = plainText;

        // Render boost count
        boostBtn.textContent = `🚀 Boost (${post.boostCount || 0})`;

        // Show edit/delete if author
        const loggedInUser = sessionStorage.getItem("username");
        if (loggedInUser && loggedInUser === post.username) {
            const editBtn = document.createElement("button");
            editBtn.className = "btn btn-warning mb-2 w-100";
            editBtn.textContent = "✏️ Edit";
            editBtn.setAttribute("data-bs-toggle", "modal");
            editBtn.setAttribute("data-bs-target", "#editModal");

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-danger w-100";
            deleteBtn.textContent = "🗑️ Delete";
            deleteBtn.onclick = async () => {
                if (confirm("Are you sure you want to delete this post?")) {
                    try {
                        const delRes = await fetch(`http://localhost:8080/api/v1/post/delete/${postId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });

                        if (delRes.ok) {
                            alert("✅ Post deleted successfully!");
                            window.location.href = "dashboard.html";
                        } else {
                            const errData = await delRes.json().catch(() => ({}));
                            alert(`❌ ${errData.message || delRes.status}`);
                        }
                    } catch (err) {
                        console.error(err);
                        alert("⚠️ Error deleting post");
                    }
                }
            };

            actionsEl.appendChild(editBtn);
            actionsEl.appendChild(deleteBtn);
        }

        // Prefill modal
        const editTitle = document.getElementById("editTitle");
        const editContent = document.getElementById("editContent");
        editTitle.value = post.title;
        editContent.value = post.content;

        // Handle edit
        const editForm = document.getElementById("editForm");
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            try {
                const updateRes = await fetch(`http://localhost:8080/api/v1/post/edit/${postId}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: editTitle.value,
                        content: editContent.value
                    })
                });

                if (updateRes.ok) {
                    alert("✅ Post updated successfully!");
                    location.reload();
                } else {
                    const errData = await updateRes.json().catch(() => ({}));
                    alert(`❌ ${errData.message || updateRes.status}`);
                }
            } catch (err) {
                console.error(err);
                alert("⚠️ Error updating post");
            }
        });

        // ========================
        // Load comments
        // ========================
        await loadComments();

        // ========================
        // Boost handler
        // ========================
        boostBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/v1/boost/${postId}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                const result = await res.json();
                boostBtn.textContent = `🚀 Boost (${result.data})`;
            } catch (err) {
                console.error("Boost failed:", err);
            }
        });

        // ========================
        // Add comment
        // ========================
        addCommentBtn.addEventListener("click", async () => {
            const content = commentInput.value.trim();
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
                commentInput.value = "";
                await loadComments();
            } catch (err) {
                console.error("Add comment failed:", err);
            }
        });

        // ========================
        // Function: Load comments
        // ========================
        async function loadComments() {
            try {
                const res = await fetch(`http://localhost:8080/api/v1/comment/${postId}`);
                const data = await res.json();
                console.log("Comments data:", data);
                commentsList.innerHTML = data.data.length
                    ? data.data.map(c => `<div class="p-2 mb-1 rounded shadow-sm bg-light"><strong>${c.userId}:</strong> ${c.content}</div>`).join("")
                    : "<div class='text-muted'>No comments yet</div>";
            } catch (err) {
                console.error("Load comments failed", err);
            }
        }

    } catch (err) {
        console.error("Failed to load post:", err);
        titleEl.textContent = "⚠️ Error loading story.";
    }
});
