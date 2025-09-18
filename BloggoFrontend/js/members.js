document.addEventListener("DOMContentLoaded", async () => {
    const membersContainer = document.getElementById("MembersTabsContent");
    const postsContainer = document.getElementById("notificationTabsContent");
    const token = sessionStorage.getItem("jwtToken");
    const loggedUserId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

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

    await getFollowing();
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

        const response = await fetch(`http://localhost:8080/api/v1/follows/${loggedUserId}/count`,{
            headers:{
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)throw new Error("Failed to load followers")
        const count = await response.json();
        console.log(count)

        const data = await res.json();
        console.log("Response:", data);

        const users = data.data || []; // <-- this is the correct place
        console.log("Users:", users);


        membersContainer.innerHTML = "";

        if (!users.length) {
            membersContainer.innerHTML = "<p class='text-muted'>No members found.</p>";
            return;
        }

        if (users.length) {
            // Prepare an array of promises to check follow status
            const followStatusPromises = users.map(async user => {
                let isFollowing = false;
                try {
                    const followCheckRes = await fetch(`http://localhost:8080/api/v1/follows/is-following/${user.userId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (followCheckRes.ok) {
                        const followCheck = await followCheckRes.json();
                        isFollowing = followCheck.data === true;
                    }
                } catch (err) {
                    console.error("Error checking follow status for user:", user.userId, err);
                }
                return { user, isFollowing };
            });

            // Run all follow checks in parallel
            const usersWithFollowStatus = await Promise.all(followStatusPromises);

            // Render all user cards
            membersContainer.innerHTML = "";
            usersWithFollowStatus.forEach(({ user, isFollowing }) => {
                const memberCard = document.createElement("div");
                memberCard.classList.add(
                    "card", "p-3", "mb-3", "d-flex",
                    "align-items-center", "flex-row", "justify-content-between",
                    "user-card"
                );
                memberCard.dataset.userId = user.userId;

                memberCard.innerHTML = `
            <div class="d-flex align-items-center flex-grow-1">
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
            <button class="btn btn-sm follow-btn ${isFollowing ? 'btn-secondary' : 'btn'}" 
                    data-user-id="${user.userId}" ${isFollowing ? 'disabled' : ''}>
                ${isFollowing ? 'Following' : 'Follow'}
            </button>
        `;

                membersContainer.appendChild(memberCard);
            });
        }


// ============================
// Navigate to member profile
// ============================
        document.querySelectorAll(".user-card").forEach(card => {
            card.addEventListener("click", (e) => {
                // Avoid clicking the follow button triggering navigation
                if (e.target.classList.contains("follow-btn")) return;

                const userId = card.dataset.userId;
                window.location.href = `members-profile.html?userId=${userId}`;
            });
        });

        document.querySelectorAll(".follow-btn").forEach(btn => {
            btn.addEventListener("click", async event => {
                const followedId = event.target.dataset.userId;

                try {
                    const followRes = await fetch(`http://localhost:8080/api/v1/follows/${followedId}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });

                    const apiResponse = await followRes.json();

                    if (!followRes.ok || apiResponse.status !== 200) {
                        console.error("Failed to follow user:", apiResponse.message);
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Could not follow user. Try again.',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }


                    // ✅ Update button text
                    event.target.textContent = "Following";
                    event.target.classList.remove("btn-primary");
                    event.target.classList.add("btn-secondary");
                    event.target.disabled = true;

                    // Optional: show success toast/alert
                    console.log(apiResponse.message); // "Follow successful"

                } catch (err) {
                    console.error(err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Could not follow user. Try again.',
                        confirmButtonText: 'OK'
                    });
                }

            });
        });



    } catch (err) {
        console.error("Error loading members:", err);
    }
});


async function loadUserProfile(token) {
    const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

    if (!userId) {
        console.error("Logged-in user ID not found in cookies");
        return;
    }

    try{
        const res = await fetch("http://localhost:8080/user/me",{
            headers:{
                "Authorization" : `Bearer ${token}`
            }
        });

        const response = await fetch(`http://localhost:8080/api/v1/follows/${userId}/count`,{
            headers:{
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)throw new Error("Failed to load followers")
        const count = await response.json();
        console.log(count)

        if (!res.ok) throw new Error("Failed to load user...")

        const user = await res.json();
        console.log("user profile:", user);

        // Fill sidebar
        document.querySelector(".profile-avatar").src = user.profileImage || "../assets/client1.jpg";
        document.querySelector(".profile-name").textContent = user.username;
        document.querySelector(".profile-bio").textContent = user.bio || "No bio yet";

        const followersEl = document.querySelector("#edit-profile-card p a");
        if (followersEl) followersEl.textContent = `${count.followersCount || 0} Followers`;

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
            const walletRes = await fetch(`http://localhost:8080/user/getWallet/${user.userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const walletApiResponse = await walletRes.json();
            console.log("Full wallet API response:", walletApiResponse);

            // Handle both object & array
            let walletData = walletApiResponse.data || {};
            if (Array.isArray(walletData)) {
                walletData = walletData[0] || {};
            }

            // Use balance safely
            const walletBalance = walletData.balance || 0;

            const walletEarningsDiv = document.createElement("div");
            walletEarningsDiv.classList.add("d-flex", "gap-3", "mb-3");
            walletEarningsDiv.innerHTML = `
        <div class="wallet flex-fill p-3 bg-light rounded d-flex align-items-center justify-content-between">
            <div>
                <h6 class="mb-1"><i class="fas fa-wallet me-2 text-primary"></i> Wallet</h6>
                <p class="fw-bold mb-0">$ ${walletBalance.toFixed(2)}</p>
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