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

    const token = sessionStorage.getItem("jwtToken");
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
        document.querySelector(".avatar").src = user.profileImage || "default.png";

        // Followers count
        const followersLink = document.querySelector("#edit-profile-card p a");
        followersLink.textContent = `${user.followers.length} Followers`;
    }catch (err){
        console.error("Error loading user...")
    }
});

// Initialize bookmark status
checkBookmarkStatus();

function logout() {
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Redirect to login page
    window.location.href = 'login.html';
}