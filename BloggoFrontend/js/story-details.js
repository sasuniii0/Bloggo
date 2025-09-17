document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const token = sessionStorage.getItem("jwtToken");
    let loggedInUser = sessionStorage.getItem("username");

    if (!postId) return alert("⚠️ Story not found");


    await loadLoggedUser();
    await loadCurrentUser(token)

    // ============================
// Load Current User for Avatar
// ============================
    async function loadCurrentUser(token) {
        try {
            const res = await fetch("http://localhost:8080/user/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to load user");
            const user = await res.json();
            const avatar = document.querySelector(".avatar");
            if (avatar) avatar.src = user.profileImage || "../assets/default.png";
        } catch (err) {
            console.error("Error loading user:", err);
        }
    }

    loggedInUser = sessionStorage.getItem("username"); // refresh after loadLoggedUser

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
    const bookmarkBtn = document.getElementById("bookmarkBtn");

    const editForm = document.getElementById("editForm");
    const editTitle = document.getElementById("editTitle");
    const editContent = document.getElementById("editContent");
    const coverInput = document.getElementById("coverPicture");
    const coverPreview = document.getElementById("coverPreview");

    const downloadPdfBtn = document.getElementById("downloadPdfBtn");

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            downloadPdf(postId);
        });
    }

    function downloadPdf(postId) {
        window.open(`http://localhost:8080/api/v1/pdf/download-pdf/${postId}`, "_blank");
    }


    if (!token) {
        titleEl.textContent = "⚠️ Please log in to view the story.";
        return;
    }

    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "flex";

    // --- Fetch JSON with Auth ---
    const fetchJSON = async (url, options = {}) => {
        options.headers = options.headers || {};
        if (!options.headers["Authorization"]) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(url, options);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw data;
        return data;
    };

    let currentPost = null;

    // --- Load Post ---
    try {
        const data = await fetchJSON(`http://localhost:8080/api/v1/dashboard/post/${postId}`);
        const post = data.data;
        currentPost = post;

        console.log("Loaded post:", post);

        // Render post info
        titleEl.textContent = post.title || "Untitled";
        authorNameEl.textContent = post.username || "Unknown";
        publishDateEl.textContent = new Date(post.publishedAt).toLocaleDateString();
        contentEl.innerHTML = post.content || "No content available.";

        const coverUrl = post.imageUrl || "";
        storyImageEl.src = coverUrl;
        coverPreview.src = coverUrl;
        coverPreview.style.display = coverUrl ? "block" : "none";

        // Author clickable → members page
        authorNameEl.style.cursor = "pointer";
        authorNameEl.addEventListener("click", () => {
            window.location.href = `../pages/members-profile.html?username=${encodeURIComponent(post.username)}`;
        });

        // Show Edit/Delete buttons if author
        if (loggedInUser && loggedInUser === post.username) createPostActions();

        // Prefill edit modal
        editTitle.value = post.title;
        editContent.value = post.content;

        function updateBoostUI() {
            const hasBoosted = currentPost.boostedByCurrentUser;
            boostCountEl.textContent = currentPost.boostCount || 0;

            if (hasBoosted) {
                boostBtn.classList.add("active", "boost-btn");
                boostBtn.disabled = true;
                boostCountEl.innerHTML += " Boosted";
            } else {
                boostBtn.classList.remove("active");
                boostBtn.classList.add("boost-btn");
                boostBtn.disabled = false;
                boostCountEl.innerHTML += " Boost";
            }
        }

        updateBoostUI();

        // Load comments
        await loadComments();

    } catch (err) {
        console.error("Error loading post:", err);
        titleEl.textContent = "⚠️ Error loading story.";
    } finally {
        if (loading) loading.style.display = "none";
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
            coverPreview.src = currentPost.imageUrl || "";
            coverPreview.style.display = currentPost.imageUrl ? "block" : "none";
            storyImageEl.src = currentPost.imageUrl || "";
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
                window.location.href = "stories.html";
            } catch (err) {
                alert(`❌ ${err.message || "Failed to delete post"}`);
            }
        };

        actionsEl.append(editBtn, deleteBtn);
    }

    // --- Edit Form Submission ---
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        let coverImageUrl = currentPost.imageUrl;
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

    // --- Bookmark button logic ---
    async function updateBookmarkButton() {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Save';
            return;
        }

        try {
            // Check initial bookmark status
            const checkResponse = await fetch(`http://localhost:8080/api/v1/bookmarks/check/${postId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            let checkData;
            try {
                checkData = await checkResponse.json();
            } catch {
                console.warn("Check bookmark response is not JSON:", await checkResponse.text());
                return;
            }

            const isBookmarked = checkData.data;
            bookmarkBtn.innerHTML = isBookmarked
                ? '<i class="fas fa-bookmark"></i> Saved'
                : '<i class="far fa-bookmark"></i> Save';

        } catch (err) {
            console.error("Error checking bookmark:", err);
        }
    }

// Call once on page load
    await updateBookmarkButton();

// Toggle bookmark on click
    bookmarkBtn.addEventListener("click", async () => {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) return alert("⚠️ Please log in to save bookmarks.");

        try {
            const response = await fetch(`http://localhost:8080/api/v1/bookmarks/toggle/${postId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const text = await response.text(); // Read raw response first
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                console.warn("Bookmark toggle response not JSON:", text);
                return alert("⚠️ Backend returned invalid data.");
            }

            if (response.ok && data.status === 200) {
                const isBookmarked = data.data;
                bookmarkBtn.innerHTML = isBookmarked
                    ? '<i class="fas fa-bookmark"></i> Saved'
                    : '<i class="far fa-bookmark"></i> Save';
            } else {
                console.error("Failed toggle response:", data);
                alert("⚠️ Failed to toggle bookmark");
            }

        } catch (err) {
            console.error("Toggle bookmark failed:", err);
            alert("⚠️ Error toggling bookmark");
        }
    });

    // --- Boost Button ---
    boostBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/boost/${postId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            currentPost.boostCount = data.data.boostCount;
            currentPost.boostedByCurrentUser = data.data.boostedByCurrentUser;

            updateBoostUI();
        } catch (err) {
            console.error("Boost failed:", err);
            alert("Boost failed! Make sure you are logged in.");
        }
    });

    // --- Load Comments ---
    async function loadComments() {
        try {
            const data = await fetch(`http://localhost:8080/api/v1/comment/${postId}`).then(r => r.json());
            const comments = data.data || [];
            commentsCountEl.textContent = comments.length;
            commentsList.innerHTML = comments.length
                ? comments.map(c => `
                    <div class="comment d-flex gap-2 align-items-start mb-2">
                        <img src="${c.profileImage || '../assets/default.png'}" 
                             alt="Profile" 
                             class="rounded-circle" 
                             style="width:40px;height:40px;object-fit:cover;">
                        <div class="comment-content">
                            <div class="comment-header d-flex justify-content-between">
                                <div class="fw-semibold">${c.userId || 'Anonymous'}</div>
                                <div class="small text-muted">${new Date(c.createdAt).toLocaleDateString()}</div>
                            </div>
                            <p class="mb-0">${c.content}</p>
                        </div>
                    </div>
                `).join("")
                : "<div class='text-center py-3 text-muted'>No comments yet.</div>";

        } catch (err) {
            console.error("Load comments failed:", err);
            commentsList.innerHTML = "<div class='text-center py-3 text-muted'>Error loading comments</div>";
        }
    }

    // --- Add Comment ---
    document.getElementById("addCommentBtn").addEventListener("click", async () => {
        const commentInput = document.getElementById("commentInput");
        const content = commentInput.value.trim();
        if (!content) return alert("⚠️ Please write something");

        try {
            const payload = { content };
            const response = await fetch(`http://localhost:8080/api/v1/comment/post/${postId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            commentInput.value = "";
            await loadComments();
        } catch (err) {
            console.error("Post comment failed:", err);
            alert("❌ Failed to post comment. Please try again.");
        }
    });

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

async function loadLoggedUser() {
    const token = sessionStorage.getItem("jwtToken");
    try {
        const res = await fetch(`http://localhost:8080/user/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const user = await res.json();  // backend returns DTO directly
        console.log("Logged user:", user);

        if (res.ok) {
            // Avatar
            document.querySelector(".avatar").src = user.profileImage || "../assets/default.png";
            document.getElementById("userAvatar").src = user.profileImage || "../assets/default.png";

            // Navbar username
            if (document.getElementById("navbarUsername")) {
                document.getElementById("navbarUsername").textContent = user.username;
            }

            // Save for later
            sessionStorage.setItem("username", user.username);
            sessionStorage.setItem("userId", user.id);
        } else {
            document.querySelector(".avatar").src = "../assets/default.png";
        }
    } catch (err) {
        console.error("Failed to load user:", err);
        document.querySelector(".avatar").src = "../assets/default.png";
    }
}
