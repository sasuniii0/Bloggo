document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id"); // get ?id=xxx from URL
    const token = sessionStorage.getItem("jwtToken");

    if (!postId) return;

    const titleEl = document.querySelector("h1");
    const authorEl = document.querySelector(".text-muted strong");
    const dateEl = document.querySelector(".text-muted");
    const contentEl = document.querySelector("main p:last-of-type");

    if (!token) {
        titleEl.textContent = "⚠️ Please log in to view the story.";
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/api/v1/dashboard/post/${postId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch post");

        const data = await res.json();
        const post = data.data;

        // Render post details
        titleEl.textContent = post.title || "Untitled";
        authorEl.textContent = post.username || "Unknown";
        dateEl.innerHTML = `By <strong>${post.username || "Unknown"}</strong> · ${new Date(post.publishedAt).toLocaleDateString()}`;

        // ✅ Strip HTML tags and show plain text
        const plainText = post.content ? post.content.replace(/<[^>]+>/g, '') : "No content available.";
        contentEl.textContent = plainText;

        // ✅ Add Edit & Delete buttons if user is the author
        const loggedInUser = sessionStorage.getItem("username"); // save username at login
        if (loggedInUser && loggedInUser === post.username) {
            const actionsDiv = document.createElement("div");
            actionsDiv.classList.add("mt-3");

            const editBtn = document.createElement("button");
            editBtn.className = "btn btn-warning me-2";
            editBtn.textContent = "✏️ Edit";
            editBtn.onclick = () => {
                window.location.href = `blog-editor.html?id=${postId}`;
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-danger";
            deleteBtn.textContent = "🗑️ Delete";
            deleteBtn.onclick = async () => {
                if (confirm("Are you sure you want to delete this post?")) {
                    try {
                        const delRes = await fetch(`http://localhost:8080/api/v1/dashboard/post/${postId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (delRes.ok) {
                            alert("Post deleted successfully!");
                            window.location.href = "dashboard.html";
                        } else {
                            alert("Failed to delete post");
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Error deleting post");
                    }
                }
            };

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            contentEl.parentNode.appendChild(actionsDiv);
        }

    } catch (err) {
        console.error("Failed to load post:", err);
        titleEl.textContent = "⚠️ Error loading story.";
    }
});
