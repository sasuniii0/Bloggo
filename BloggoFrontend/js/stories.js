document.addEventListener("DOMContentLoaded", async () => {
    const storiesContainer = document.getElementById("myStories");

    const token = sessionStorage.getItem("jwtToken");
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

        function renderPosts(list) {
            if (!list.length) {
                return `<p class="text-muted text-center">No stories found.</p>`;
            }

            return list.map(post => `
        <div class="card mb-3 shadow-sm" style="border-radius: 10px;">
            <div class="card-body d-flex flex-column">
                
                <!-- Cover Image (small square, if exists) -->
                ${post.imageUrl ? `
                <div style="width:80px; height:80px; overflow:hidden; border-radius:8px; margin-bottom:10px;">
                    <img src="${post.imageUrl}" alt="Cover Image" 
                         style="width:100%; height:100%; object-fit:cover;">
                </div>` : ""}

                <!-- Title -->
                <h5 class="card-title mb-1">${post.title || "Untitled"}</h5>
                
                <!-- Status and Date -->
                <div class="text-muted small mb-2">
                    ${post.status || ""} • 
                    ${post.createdAt || post.publishedAt
                ? new Date(post.createdAt || post.publishedAt).toLocaleDateString()
                : "Unknown"}
                </div>
                
                <!-- Content Preview -->
                <p class="card-text mb-3">
                    ${post.content ? post.content.substring(0, 300) + "..." : ""}
                </p>
                
                <!-- Read More Link -->
                <a href="story-detail.html?id=${post.id || post.postId}" 
                   class="text-decoration-none mb-3">
                   Read More
                </a>
                
                <!-- Action Buttons -->
                <div class="d-flex justify-content-start align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary like-btn" data-id="${post.id}">
                        🚀 Boost <span class="like-count">${post.likes || 0}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary comment-btn" data-id="${post.id}">
                        💬 Comments (${post.commentsCount || 0})
                    </button>
                    <button class="btn btn-sm btn-outline-warning bookmark-btn ms-auto" data-id="${post.id}">
                        🔖 Save
                    </button>
                </div>
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
            console.log("user profile:", user);

            // Fill sidebar
            document.querySelector(".profile-avatar").src = user.profileImage || "../assets/client1.jpg";
            document.querySelector(".profile-name").textContent = user.username;
            document.querySelector(".profile-bio").textContent = user.bio || "No bio yet";

            const roleBadge = document.querySelector('.profile-name + small');

            if (user.roleName === "MEMBER") {
                roleBadge.innerHTML = `<i class="fas fa-star text-warning me-1"></i> Premium Member`;
            } else {
                roleBadge.textContent = "User";
            }
            // Top navbar avatar
            document.querySelector(".avatar").src = user.profileImage || "../assets/client1.jpg";

            // Toggle wallet & earnings for member
            if (user.roleName === "MEMBER") {
                // Fetch wallet & earnings
                const walletRes = await fetch(`http://localhost:8080/user/user/${user.userId}/wallet`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const wallet = await walletRes.json();
                console.log(wallet);

                // Create wallet & earnings block dynamically
                const walletEarningsDiv = document.createElement("div");
                walletEarningsDiv.classList.add("d-flex", "gap-3", "mb-3");

                const totalEarnings = wallet.earnings.reduce((sum, e) => sum + e.amount, 0);

                walletEarningsDiv.innerHTML = `
        <div class="wallet flex-fill p-3 bg-light rounded d-flex align-items-center justify-content-between">
            <div>
                <h6 class="mb-1"><i class="fas fa-wallet me-2 text-primary"></i> Wallet</h6>
                <p class="fw-bold mb-0">LKR ${wallet.balance.toFixed(2)}</p>
            </div>
        </div>

        <div class="earnings flex-fill p-3 bg-light rounded d-flex align-items-center justify-content-between">
            <div>
                <h6 class="mb-1"><i class="fas fa-chart-line me-2 text-success"></i> Earnings</h6>
                <p class="fw-bold mb-0">LKR ${totalEarnings.toFixed(2)}</p>
            </div>
        </div>
    `;

                // Insert inside profile card before the "Edit profile" button
                const profileCard = document.getElementById("edit-profile-card");
                const editBtn = profileCard.querySelector("a.btn");
                profileCard.insertBefore(walletEarningsDiv, editBtn);
            }


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
    preventBackNavigation();
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Redirect to login page
    window.location.href = 'signing.html';
}
function preventBackNavigation() {
    // Replace current history entry
    window.history.replaceState(null, null, window.location.href);

    // Add new history entry
    window.history.pushState(null, null, window.location.href);

    // Handle back button press
    window.onpopstate = function() {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}

const loading = document.getElementById("loading");

// Show loader
function showLoader() {
    loading.classList.add("show");
}

// Hide loader
function hideLoader() {
    loading.classList.remove("show");
    // optional: delay setting display none to match fade
    setTimeout(() => loading.style.display = "none", 400);
}

// Example usage in your DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    showLoader();

    try {
        // your fetch logic here
    } catch (err) {
        console.error(err);
    } finally {
        hideLoader();
    }
});
// Example JS to toggle UI based on role
const isPremium = true; // replace with backend value

if (!isPremium) {
    document.querySelector('.wallet').style.display = 'none';
    document.querySelector('.earnings').style.display = 'none';
    // Optional: change badge text
    document.querySelector('.profile-name + small').textContent = 'User';
}

