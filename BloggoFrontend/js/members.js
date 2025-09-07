document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (!username) {
        console.error("No username provided");
        return;
    }

    // Update page title
    document.getElementById("title").textContent = `${username} | Profile`;

    // Load user profile + posts
    await loadUserProfile(username);
    await loadUserPosts(username);
});

async function loadUserProfile(username) {
    try {
        const token = sessionStorage.getItem("jwtToken"); // get token if you have auth

        const res = await fetch(`http://localhost:8080/user/${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch user profile");

        const user = await res.json();

        document.querySelector(".profile-avatar").src = user.profileImage || "../assets/client1.jpg";
        document.querySelector(".profile-name").textContent = user.username;
        document.querySelector(".profile-bio").textContent = user.bio || "No bio available.";
        document.querySelector("#edit-profile-card p a").textContent = `${user.followersCount || 0} Followers`;

        // Toggle wallet & earnings for member
        if (user.membershipStatus !== "MEMBER") {
            document.querySelector('.wallet').style.display = 'none';
            document.querySelector('.earnings').style.display = 'none';
        } else {
            // Fetch wallet & earnings
            const walletRes = await fetch(`http://localhost:8080/user/user/${user.userId}/wallet`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const wallet = await walletRes.json();
            console.log(wallet)

            document.querySelector('.wallet p').textContent = `LKR ${wallet.balance.toFixed(2)}`;
            const totalEarnings = wallet.earnings.reduce((sum, e) => sum + e.amount, 0);
            document.querySelector('.earnings p').textContent = `LKR ${totalEarnings.toFixed(2)}`;
        }


    } catch (err) {
        console.error("Error loading user profile:", err);
    }
}

async function loadUserPosts(username) {
    try {
        const token = sessionStorage.getItem("jwtToken"); // get token if you have auth

        const res = await fetch(`http://localhost:8080/user/${username}/posts`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch user posts");

        const posts = await res.json();
        const postsContainer = document.querySelector("#notificationTabsContent");

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
                <p>${post.content.substring(0, 120)}...</p>
                <a href="story-detail.html?id=${post.id}" class="btn btn-sm btn-outline-primary">Read More</a>
            `;
            postsContainer.appendChild(postEl);
        });

    } catch (err) {
        console.error("Error loading user posts:", err);
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (username) {
        // Profile page of another user
        await loadUserProfile(username);
        await loadUserPosts(username);

        // 👇 overwrite navbar avatar with author's image
        const token = sessionStorage.getItem("jwtToken");
        const res = await fetch(`http://localhost:8080/user/${username}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const author = await res.json();

        document.querySelector(".avatar").src =
            author.profileImage || "../assets/default.png";
        document.getElementById("userAvatar").src =
            author.profileImage || "../assets/default.png";
    } else {
        // Default → logged-in user
        await loadLoggedUser();
    }
});
