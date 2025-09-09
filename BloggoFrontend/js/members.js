document.addEventListener("DOMContentLoaded", async () => {
    const membersContainer = document.getElementById("MembersTabsContent");
    const postsContainer = document.getElementById("notificationTabsContent");
    const token = sessionStorage.getItem("jwtToken");
    const loggedUserId = sessionStorage.getItem("userId"); // set when user logs in

    await loadCurrentUser(token);

    if (!membersContainer) {
        console.error("Members container not found!");
        return;
    }

    if (!loggedUserId) {
        console.error("Logged-in user ID not found in sessionStorage");
        return;
    }

    if (!token) {
        console.error("JWT token not found. User might not be logged in.");
        return;
    }


    await loadUserProfile(token);
    await loadUserPosts(token, postsContainer);

    const allTab = document.getElementById("all");
    allTab.innerHTML = `<div class="text-center w-100">Loading Users...</div>`;

    try {
        // Fetch all users except admin & logged-in user
        const res = await fetch(`http://localhost:8080/user/members?loggedUserId=${loggedUserId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch members:", res.status, res.statusText);
            return;
        }

        const data = await res.json();
        console.log("Response:", data);

        const users = data.data || []; // <-- this is the correct place
        console.log("Users:", users);


        membersContainer.innerHTML = "";

        if (!users.length) {
            membersContainer.innerHTML = "<p class='text-muted'>No members found.</p>";
            return;
        }


        users.forEach(user => {
            const memberCard = document.createElement("div");
            memberCard.classList.add(
                "card", "p-3", "mb-3", "d-flex",
                "align-items-center", "flex-row", "justify-content-between"
            );

            memberCard.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${user.profileImage || '../assets/client1.jpg'}" 
                         class="rounded-circle me-3" width="50" height="50" alt="Profile">
                    <div>
    <strong>${user.username}</strong>
    <small class="text-muted ms-1">
        ${user.role || 'USER'}
        ${user.role === 'MEMBER' ? '<i class="fas fa-star text-warning ms-1"></i>' : ''}
    </small>
</div>

                </div>
                <button class="btn btn-primary btn-sm follow-btn" data-user-id="${user.userId}">
                    Follow
                </button>
            `;

            membersContainer.appendChild(memberCard);
        });

        // Add follow button functionality
        document.querySelectorAll(".follow-btn").forEach(btn => {
            btn.addEventListener("click", async event => {
                const followedId = event.target.dataset.userId;
                try {
                    const followRes = await fetch(`http://localhost:8080/follow`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            followerId: loggedUserId,
                            followedId: followedId
                        })
                    });

                    if (!followRes.ok) {
                        console.error("Failed to follow user:", followRes.status, followRes.statusText);
                        alert("Could not follow user. Try again.");
                        return;
                    }

                    event.target.textContent = "Following";
                    event.target.disabled = true;
                } catch (err) {
                    console.error(err);
                    alert("Could not follow user. Try again.");
                }
            });
        });

    } catch (err) {
        console.error("Error loading members:", err);
    }
});

async function loadUserProfile(token) {
    try {
        const username = sessionStorage.getItem("username");
        if (!username) {
            console.error("Username not found in sessionStorage");
            return;
        }

        const res = await fetch(`http://localhost:8080/user/${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch user profile:", res.status, res.statusText);
            return;
        }

        const user = await res.json();

        const avatarEl = document.querySelector(".profile-avatar");
        const nameEl = document.querySelector(".profile-name");
        const bioEl = document.querySelector(".profile-bio");
        const followersEl = document.querySelector("#edit-profile-card p a");

        if (avatarEl) avatarEl.src = user.profileImage || "../assets/client1.jpg";
        if (nameEl) nameEl.textContent = user.username;
        if (bioEl) bioEl.textContent = user.bio || "No bio available.";
        if (followersEl) followersEl.textContent = `${user.followersCount || 0} Followers`;

        // Toggle wallet & earnings for member
        const walletEl = document.querySelector('.wallet');
        const earningsEl = document.querySelector('.earnings');

        if (user.membershipStatus !== "MEMBER") {
            if (walletEl) walletEl.style.display = 'none';
            if (earningsEl) earningsEl.style.display = 'none';
        } else {
            if (walletEl && earningsEl) {
                const walletRes = await fetch(`http://localhost:8080/user/user/${user.userId}/wallet`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (walletRes.ok) {
                    const wallet = await walletRes.json();

                    // Safely set wallet balance
                    const balance = typeof wallet.balance === 'number' ? wallet.balance.toFixed(2) : '0.00';
                    if (walletEl) {
                        const pEl = walletEl.querySelector('p');
                        if (pEl) pEl.textContent = `LKR ${balance}`;
                    }

                    // Safely calculate total earnings
                    const totalEarnings = Array.isArray(wallet.earnings)
                        ? wallet.earnings.reduce((sum, e) => sum + (e.amount || 0), 0)
                        : 0;

                    if (earningsEl) {
                        const pEl = earningsEl.querySelector('p');
                        if (pEl) pEl.textContent = `LKR ${totalEarnings.toFixed(2)}`;
                    }
                }

            }
        }

    } catch (err) {
        console.error("Error loading user profile:", err);
    }
}

async function loadUserPosts(token, postsContainer) {
    try {
        if (!postsContainer) return;

        const username = sessionStorage.getItem("username");
        if (!username) {
            console.error("Username not found in sessionStorage");
            return;
        }

        const res = await fetch(`http://localhost:8080/user/${username}/posts`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch user posts:", res.status, res.statusText);
            postsContainer.innerHTML = "<p class='text-muted'>Could not load posts.</p>";
            return;
        }

        const posts = await res.json();

        if (!posts.length) {
            postsContainer.innerHTML = "<p class='text-muted'>No posts yet.</p>";
            return;
        }

        postsContainer.innerHTML = "";
        posts.forEach(post => {
            const postEl = document.createElement("div");
            postEl.classList.add("card", "mb-3", "p-3");
            postEl.innerHTML = `
                <h5>${post.title}</h5>
                <small class="text-muted">${new Date(post.publishedAt).toLocaleDateString()}</small>
                <p>${post.content?.substring(0, 120) || ""}...</p>
                <a href="story-detail.html?id=${post.id}" class="btn btn-sm btn-outline-primary">Read More</a>
            `;
            postsContainer.appendChild(postEl);
        });

    } catch (err) {
        console.error("Error loading user posts:", err);
        if (postsContainer) postsContainer.innerHTML = "<p class='text-muted'>Could not load posts.</p>";
    }
}

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
        if (avatar) avatar.src = user.profileImage || "../assets/client1.jpg";
    } catch (err) {
        console.error("Error loading user:", err);
    }
}