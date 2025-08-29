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