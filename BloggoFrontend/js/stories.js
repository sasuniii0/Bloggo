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
            if (post.status === "PUBLISHED") grouped.PUBLISHED.push(post);
            else if (post.status === "DRAFT") grouped.DRAFT.push(post);
            else if (post.status === "ARCHIVED") grouped.ARCHIVED.push(post);
            else if (post.status === "SCHEDULED") grouped.SCHEDULED.push(post);
        });

        // Render post cards
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
                       class="btn btn-sm btn-outline-primary mb-2">
                        Read More
                    </a>

                    <!-- Action bar -->
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div class="d-flex gap-3">
                            <button class="btn btn-sm btn-outline-secondary like-btn" data-id="${post.id}">
                                🚀 Boost <span class="like-count">${post.likes || 0}</span>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary comment-btn" data-id="${post.id}">
                                💬 Comments (${post.commentsCount || 0})
                            </button>
                        </div>
                        <button class="btn btn-sm btn-outline-warning bookmark-btn" data-id="${post.id}">
                            🔖 Save
                        </button>
                    </div>
                </div>
            `).join("");
        }

        // Build tab layout
        storiesContainer.innerHTML = `
        <div class="container mt-8">
            <ul class="nav nav-tabs d-flex justify-content-start" id="storiesTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="published-tab" data-bs-toggle="tab" data-bs-target="#published" type="button" role="tab">Published</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="draft-tab" data-bs-toggle="tab" data-bs-target="#draft" type="button" role="tab">Draft</button>
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
        </div>
            
        `;

        if (!token) return;

        try{
            const res = await fetch("http://localhost:8080/user/me",{
                headers:{
                    "Authorization" : `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to load user...")

            const user = await res.json();

            // Fill sidebar
            document.querySelector(".profile-avatar").src = user.profileImage || "default.png";
            document.querySelector(".profile-name").textContent = user.username;
            document.querySelector(".profile-bio").textContent = user.bio || "No bio yet";

            // Followers count
            const followersLink = document.querySelector("#edit-profile-card p a");
            followersLink.textContent = `${user.followers.length} Followers`;
        } catch (err){
            console.error()
        }

        // Event Handlers
        function handleLike(postId, btn) {
            fetch(`http://localhost:8080/api/v1/post/${postId}/like`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Like response:", data);
                    const countSpan = btn.querySelector(".like-count");
                    countSpan.textContent = parseInt(countSpan.textContent) + 1;
                })
                .catch(err => console.error("Error liking post:", err));
        }

        function handleBookmark(postId) {
            fetch(`http://localhost:8080/api/v1/post/${postId}/bookmark`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Bookmark response:", data);
                    alert("Post saved to bookmarks!");
                })
                .catch(err => console.error("Error bookmarking post:", err));
        }

        function handleComments(postId) {
            window.location.href = `story-detail.html?id=${postId}#comments`;
        }

        // Attach event listeners
        document.querySelectorAll(".like-btn").forEach(btn => {
            btn.addEventListener("click", () => handleLike(btn.dataset.id, btn));
        });

        document.querySelectorAll(".bookmark-btn").forEach(btn => {
            btn.addEventListener("click", () => handleBookmark(btn.dataset.id));
        });

        document.querySelectorAll(".comment-btn").forEach(btn => {
            btn.addEventListener("click", () => handleComments(btn.dataset.id));
        });

    } catch (err) {
        console.error("Error loading stories:", err);
        storiesContainer.innerHTML = `<p class="text-danger">⚠️ Error loading stories.</p>`;
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