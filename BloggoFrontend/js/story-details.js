// story-detail.js
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

        titleEl.textContent = post.title || "Untitled";
        authorEl.textContent = post.username || "Unknown";
        dateEl.innerHTML = `By <strong>${post.username || "Unknown"}</strong> · ${new Date(post.publishedAt).toLocaleDateString()}`;
        contentEl.textContent = post.content || "No content available.";

    } catch (err) {
        console.error("Failed to load post:", err);
        titleEl.textContent = "⚠️ Error loading story.";
    }
});
