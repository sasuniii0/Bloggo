document.addEventListener("DOMContentLoaded", async () => {
    const storiesContainer = document.getElementById("myStories");

    try {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            storiesContainer.innerHTML = `<p class="text-danger">⚠️ You must be logged in to view your stories.</p>`;
            return;
        }

        const response = await fetch("http://localhost:8080/api/v1/post/getAll", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        console.log("API response:", data);

        // Determine the actual posts array
        let posts = [];
        if (Array.isArray(data)) {
            posts = data;                  // API returned array directly
        } else if (Array.isArray(data.posts)) {
            posts = data.posts;            // API wrapped array in 'posts'
        } else if (Array.isArray(data.data)) {
            posts = data.data;             // API wrapped array in 'data'
        }

        if (!posts || posts.length === 0) {
            storiesContainer.innerHTML = `<p class="text-muted">No stories published yet.</p>`;
            return;
        }

        // Render posts
        storiesContainer.innerHTML = posts.map(post => `
            <div class="card mb-3 p-3">
                <h5>${post.title || "Untitled"}</h5>
                <div class="text-muted small mb-2">
                    Published on ${post.createdAt || post.publishedAt ? new Date(post.createdAt || post.publishedAt).toLocaleDateString() : "Unknown"}
                </div>
                <p>${post.content ? post.content.substring(0, 200) : ""}...</p>
                <a href="story-detail.html?id=${post.postId || post.id}" class="btn btn-sm btn-outline-primary">
                    Read More
                </a>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error loading stories:", err);
        storiesContainer.innerHTML = `<p class="text-danger">⚠️ Error loading stories.</p>`;
    }
});
