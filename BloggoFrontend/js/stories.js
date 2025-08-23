document.addEventListener("DOMContentLoaded", async () => {
    const storiesContainer = document.getElementById("myStories");

    try {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            storiesContainer.innerHTML = `<p class="text-danger">⚠️ You must be logged in to view your stories.</p>`;
            return;
        }

        const response = await fetch("http://localhost:8080/api/v1/post/my-posts", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        console.log("API response:", data);

        let posts = Array.isArray(data.data) ? data.data : [];
        console.log("Fetched posts:", posts);

        // Group posts by status
        const grouped = {
            DRAFT: [],
            PUBLISHED: [],
            ARCHIVED: [],
            SCHEDULED: []
        };

        posts.forEach(post => {
            if (post.status === "PUBLISHED") {
                grouped["PUBLISHED"].push(post);
            } else if (post.status === "DRAFT") {
                grouped["DRAFT"].push(post);
            }
        });


        // Helper to render posts
        function renderPosts(list) {
            if (!list.length) {
                return `<p class="text-muted">No stories found.</p>`;
            }
            return list.map(post => `
                <div class="card mb-3 p-3">
                    <h5>${post.title || "Untitled"}</h5>
                    <div class="text-muted small mb-2">
                        ${post.status} • ${
                post.createdAt || post.publishedAt
                    ? new Date(post.createdAt || post.publishedAt).toLocaleDateString()
                    : "Unknown"
            }
                    </div>
                    <p>${post.content ? post.content.substring(0, 200) : ""}...</p>
                    <a href="story-detail.html?id=${post.postId || post.id}" 
                       class="btn btn-sm btn-outline-primary">
                        Read More
                    </a>
                </div>
            `).join("");
        }

        // Render Bootstrap tabs with content
        storiesContainer.innerHTML = `
            <ul class="nav nav-tabs d-flex justify-content-start" id="storiesTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="published-tab" data-bs-toggle="tab" data-bs-target="#published" type="button" role="tab">Published</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link " id="draft-tab" data-bs-toggle="tab" data-bs-target="#draft" type="button" role="tab">Draft</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="archived-tab" data-bs-toggle="tab" data-bs-target="#archived" type="button" role="tab">Archived</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="scheduled-tab" data-bs-toggle="tab" data-bs-target="#scheduled" type="button" role="tab">Scheduled</button>
                </li>
            </ul>
            <div class="tab-content mt-3">
                <div class="tab-pane fade show active" id="published" role="tabpanel">${renderPosts(grouped.PUBLISHED)}</div>
                <div class="tab-pane fade" id="draft" role="tabpanel">${renderPosts(grouped.DRAFT)}</div>
                <div class="tab-pane fade" id="archived" role="tabpanel">${renderPosts(grouped.ARCHIVED)}</div>
                <div class="tab-pane fade" id="scheduled" role="tabpanel">${renderPosts(grouped.SCHEDULED)}</div>
            </div>
        `;
    } catch (err) {
        console.error("Error loading stories:", err);
        storiesContainer.innerHTML = `<p class="text-danger">⚠️ Error loading stories.</p>`;
    }
});
