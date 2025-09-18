document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");

    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Please log in to view bookmarks.',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = "signing.html";
        });
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
                    <a href="story-detail.html?id=${b.postId}" class="text-decoration-none">
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
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Could not remove bookmark',
                            confirmButtonText: 'OK'
                        });
                    }

                });
            });
        } catch (err) {
            console.error(err);
            allTabEl.innerHTML = "<p class='text-danger'>Failed to load bookmarks.</p>";
        }
    };

    async function getFollowing() {
        const token = sessionStorage.getItem("jwtToken")
        const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

        try {
            // Step 1: get the list of following user IDs
            const res = await fetch(`http://localhost:8080/api/v1/follows/getFollowing?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const apiResponse = await res.json();

            if (!res.ok || apiResponse.status !== 200) {
                console.error("Failed to load following list");
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Could not load following list',
                    confirmButtonText: 'OK'
                });
                return;
            }


            const followingList = apiResponse.data || []; // [{followedId: 18}, {followedId: 25}, ...]

            // Step 2: fetch user details for each followedId
            const usersWithDetails = await Promise.all(
                followingList.map(async f => {
                    const userRes = await fetch(`http://localhost:8080/api/v1/follows/getFollwingDetails?userId=${f.followedId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    if (!userRes.ok) return null;
                    const userApiResponse = await userRes.json();
                    return userApiResponse.data; // should return { userId, username, profileImage }
                })
            );

            // Step 3: render
            const ulEl = document.querySelector(".following-list");
            if (!ulEl) return;

            ulEl.innerHTML = "";

            usersWithDetails.forEach(user => {
                if (!user) return;
                const li = document.createElement("li");
                li.className = "d-flex align-items-center mb-2";

                li.innerHTML = `
                <img src="${user.profileImage || '../assets/client1.jpg'}" class="rounded-circle me-2" width="35" height="35" alt="${user.username}">
                <span>${user.username}</span>
            `;

                ulEl.appendChild(li);
            });

            const seeAllLi = document.createElement("li");
            seeAllLi.innerHTML = `<a href="follow.html" class="text-decoration-none">See all (${usersWithDetails.length})</a>`;
            ulEl.appendChild(seeAllLi);

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Could not load following list. Try again.',
                confirmButtonText: 'OK'
            });
        }

    }


    // Simple logout
    window.logout = () => {
        sessionStorage.clear();
        window.location.href = 'signing.html';
    };

    await loadBookmarks();
    await getFollowing();
});

document.querySelector(".card").addEventListener("click", (e) => {
    const card = e.target.closest(".blog-card");
    if (!card) return;

    // Ignore clicks on buttons
    if (e.target.classList.contains("boost-btn") ||
        e.target.classList.contains("comment-toggle-btn") ||
        e.target.classList.contains("add-comment-btn") ||
        e.target.classList.contains("comment-input")) return;

    const postId = card.dataset.id;
    window.location.href = `story-detail.html?id=${postId}`;
});

