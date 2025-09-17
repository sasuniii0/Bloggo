document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");

    if (!token) {
        alert("⚠️ Please log in to view bookmarks.");
        window.location.href = "signing.html";
        return;
    }

    const allTabEl = document.getElementById("all"); // container for bookmarks

    const loadBookmarks = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/v1/bookmarks/user", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const bookmarks = await res.json();

            if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
                allTabEl.innerHTML = "<p class='text-muted'>You haven't saved any bookmarks yet.</p>";
                return;
            }

            console.log(bookmarks)

            allTabEl.innerHTML = bookmarks.map(b => `
    <div class="card p-3 mb-3 position-relative">
        <!-- Remove button (icon only) -->
        <button class="btn btn-sm btn-outline-black removeBookmarkBtn position-absolute" 
                data-post-id="${b.postId}" 
                style="top: 8px; right: 8px; border-radius: 50%; padding: 4px 7px;">
            <i class="fas fa-times"></i>
        </button>

        <div class="d-flex gap-3">
            ${b.coverImage ? `
                <div style="width:80px; height:80px; flex-shrink:0; border-radius:8px; overflow:hidden;">
                    <img src="${b.coverImage}" alt="Cover" style="width:100%; height:100%; object-fit:cover;">
                </div>
            ` : ''}
            <div class="flex-grow-1">
                <h6 class="mb-1">
                    <a href="story-details.html?id=${b.postId}" class="text-decoration-none">
                        ${b.postTitle || "Untitled"}
                    </a>
                </h6>
                <p class="text-muted mb-1" style="font-size: 14px;">By ${b.username || "Unknown"}</p>
                ${b.content ? `<p class="mb-2" style="font-size: 14px;">${b.content.substring(0, 150)}...</p>` : ''}
            </div>
        </div>
    </div>
`).join("");


            // Attach remove bookmark functionality
            allTabEl.querySelectorAll(".removeBookmarkBtn").forEach(btn => {
                btn.addEventListener("click", async e => {
                    const postId = e.currentTarget.dataset.postId;
                    try {
                        const res = await fetch(`http://localhost:8080/api/v1/bookmarks/remove/${postId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (!res.ok) throw new Error("Failed to remove bookmark");
                        loadBookmarks(); // refresh list
                    } catch (err) {
                        console.error(err);
                        alert("⚠️ Could not remove bookmark");
                    }
                });
            });

        } catch (err) {
            console.error(err);
            allTabEl.innerHTML = "<p class='text-danger'>Failed to load bookmarks.</p>";
        }
    };

    // Simple logout
    window.logout = () => {
        sessionStorage.clear();
        window.location.href = 'signing.html';
    };

    await loadBookmarks();
});
