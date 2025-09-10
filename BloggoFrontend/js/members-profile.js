document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    const token = sessionStorage.getItem("jwtToken");

    await loadLoggedUserAvatar()
    await getMorePeopleToFollow();

    if (!userId || !token) return;

    try {
        // Fetch member profile
        const res = await fetch(`http://localhost:8080/user/members/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to load user");

        const user = await res.json();

        // Safely update profile elements
        const avatarEl = document.querySelector(".profile-avatar");
        const nameEl = document.querySelector(".profile-name");
        const bioEl = document.querySelector(".profile-bio");
        const followersEl = document.getElementById("followersCount");
        const profileContainer = document.getElementById("edit-profile-card");

        if (avatarEl) avatarEl.src = user.profileImage || "../assets/client1.jpg";
        if (nameEl) nameEl.textContent = user.username || "Unknown";
        if (bioEl) bioEl.textContent = user.bio || "No bio available.";
        if (followersEl) followersEl.textContent = `${user.followersCount || 0} Followers`;

        // Fetch member posts
        const resPosts = await fetch(`http://localhost:8080/user/get/${userId}/posts`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resPosts.ok) throw new Error("Failed to load posts");

        const posts = await resPosts.json();
        console.log("Fetched posts:", posts);

        const allTab = document.getElementById("all");
        if (!allTab) return;

        allTab.innerHTML = ""; // clear previous content

        if (!posts.length) {
            allTab.innerHTML = "<p class='text-muted'>No posts yet.</p>";
        } else {
            posts.forEach(post => {
                const postEl = document.createElement("div");
                postEl.classList.add("card", "mb-3", "p-3", "d-flex", "flex-row", "align-items-start", "gap-3");

                postEl.innerHTML = `
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Cover" style="width:80px; height:80px; object-fit:cover; border-radius:4px;">` : ''}
        <div class="flex-grow-1">
            <h5>${post.title || "Untitled"}</h5>
            <small class="text-muted">${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</small>
            <p>${post.content?.substring(0, 120) || ""}...</p>
            <a href="story-detail.html?id=${post.id}" class="btn btn-sm btn-outline-primary">Read More</a>
        </div>
    `;

                allTab.appendChild(postEl);
            });

        }

    } catch (err) {
        console.error("Error loading member profile:", err);
        const profileContainer = document.getElementById("edit-profile-card");
        if (profileContainer) profileContainer.innerHTML = "<p class='text-danger'>Could not load profile.</p>";
    }
});


document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username"); // get from query string
    const token = sessionStorage.getItem("jwtToken");

    if (!username || !token) return;

    try {
        // --- Fetch user profile by username ---
        const resUser = await fetch(`http://localhost:8080/user/${username}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resUser.ok) throw new Error("Failed to load user profile");

        const user = await resUser.json();

        // Populate profile info
        document.querySelector(".profile-avatar").src = user.profileImage || "../assets/client1.jpg";
        document.querySelector(".profile-name").textContent = user.username;
        document.querySelector(".profile-bio").textContent = user.bio || "No bio available.";
        document.querySelector("#followersCount").textContent = `${user.followersCount || 0} Followers`;

        // --- Fetch user's posts ---
        const resPosts = await fetch(`http://localhost:8080/user/${username}/posts`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resPosts.ok) throw new Error("Failed to load user's posts");

        const posts = await resPosts.json();
        console.log("Fetched posts:", posts);

        const allTab = document.getElementById("all");
        if (!allTab) return;
        allTab.innerHTML = "";

        if (!posts.length) {
            allTab.innerHTML = "<p class='text-muted'>No posts yet.</p>";
        } else {
            posts.forEach(post => {
                const postEl = document.createElement("div");
                postEl.classList.add("card", "mb-3", "p-3", "d-flex", "flex-row", "align-items-start", "gap-3");

                postEl.innerHTML = `
                    ${post.coverImage ? `<img src="${post.coverImage}" alt="Cover" style="width:80px; height:80px; object-fit:cover; border-radius:4px;">` : ''}
                    <div class="flex-grow-1">
                        <h5>${post.title || "Untitled"}</h5>
                        <small class="text-muted">${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</small>
                        <p>${post.content?.substring(0, 120) || ""}...</p>
                        <a href="story-detail.html?id=${post.id}" class="btn btn-sm btn-outline-primary">Read More</a>
                    </div>
                `;

                allTab.appendChild(postEl);
            });
        }

    } catch (err) {
        console.error("Error loading member profile:", err);
        document.querySelector(".profile-container").innerHTML = "<p class='text-danger'>Could not load profile.</p>";
    }
});

async function loadLoggedUserAvatar() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    try {
        const res = await fetch(`http://localhost:8080/user/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load user");

        const user = await res.json();

        // Save username/id for later
        sessionStorage.setItem("username", user.username);
        sessionStorage.setItem("userId", user.id);

        // Update navbar avatar
        const avatarEl = document.querySelector(".avatar");
        if (avatarEl) {
            avatarEl.src = user.profileImage || "../assets/default.png";
        }

    } catch (err) {
        console.error("Failed to load logged user avatar:", err);
    }
}

async function getMorePeopleToFollow() {
    const token = sessionStorage.getItem("jwtToken");
    const loggedUserId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
    const params = new URLSearchParams(window.location.search);
    const profileOwnerId = params.get("userId"); // from query string

    if (!token || !loggedUserId || !profileOwnerId) return;

    console.log("Fetching suggestions for", { loggedUserId, profileOwnerId });

    try {
        const res = await fetch(
            `http://localhost:8080/user/suggestions?loggedUserId=${loggedUserId}&profileOwnerId=${profileOwnerId}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        if (!res.ok) throw new Error("Failed to load suggestions");

        // unwrap ApiResponseDTO
        const apiResponse = await res.json();
        const users = apiResponse.data || []; // assuming ApiResponseDTO has {status, message, data}

        console.log("Fetched suggestions:", users);

        const container = document.getElementById("more-people-container");
        if (!container) return;

        container.innerHTML = ""; // clear old items

// Show only the first 5 users
        users.slice(0, 5).forEach(user => {
            const li = document.createElement("li");
            li.className = "d-flex align-items-center mb-2";
            li.innerHTML = `
        <img src="${user.profileImage || '../assets/client1.jpg'}" 
             class="rounded-circle me-2" width="32" height="32" alt="">
        <span>${user.username}</span>
    `;
            container.appendChild(li);
        });

// Add "See all" link if more than 5 users
        if (users.length > 5) {
            container.insertAdjacentHTML("beforeend", `
        <li>
          <a href="members.html" class="text-decoration-none">See all (${users.length})</a>
        </li>
    `);
        }



        // Attach follow button handlers
        container.querySelectorAll(".followBtn").forEach(btn => {
            btn.addEventListener("click", async e => {
                const userId = e.currentTarget.dataset.userId;
                try {
                    const res = await fetch(`http://localhost:8080/user/follow/${userId}`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error("Failed to follow user");
                    e.currentTarget.textContent = "Following";
                    e.currentTarget.disabled = true;
                } catch (err) {
                    console.error("Error following user:", err);
                    alert("Could not follow user. Please try again.");
                }
            });
        });

    } catch (err) {
        console.error("Failed to load suggestions:", err);
    }
}
