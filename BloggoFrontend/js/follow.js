const BASE_URL = "http://localhost:8080"; // backend base URL

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("jwtToken");
    const loggedUserId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

    loadFollowing(loggedUserId, token);
    loadFollowers(loggedUserId, token);
});

async function loadFollowing(userId, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/v1/follows/${userId}/following`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`Failed to load followings: ${res.status}`);

        const json = await res.json();
        const users = json.data || [];
        console.log(users)

        const container = document.getElementById("following");
        container.innerHTML = "";

        if (users.length === 0) {
            container.innerHTML = `<p class="text-muted">You are not following anyone yet.</p>`;
            return;
        }

        users.forEach(user => {
            container.innerHTML += `
                <div class="user-card d-flex align-items-center mb-2 p-3">
                    <img src="${user.profileImage || '../assets/client1.jpg'}" alt="Profile" class="rounded-circle me-2" width="40" height="40">
                    <div>
                        <h6 class="mb-0">${user.username}</h6>
                        <small>${user.bio || "No bio yet"} · ${user.postCount || 0} posts</small>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error(err);
    }
}

async function loadFollowers(userId, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/v1/follows/${userId}/followers`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`Failed to load followers: ${res.status}`);

        const json = await res.json();
        const users = json.data || [];
        console.log(users)

        const container = document.getElementById("followers");
        container.innerHTML = "";

        if (users.length === 0) {
            container.innerHTML = `<p class="text-muted">You have no followers yet.</p>`;
            return;
        }

        users.forEach(user => {
            container.innerHTML += `
                <div class="user-card d-flex align-items-center mb-2 p-3">
                    <img src="${user.profileImage || '../assets/client1.jpg'}" alt="Profile" class="rounded-circle me-2" width="40" height="40">
                    <div>
                        <h6 class="mb-0">${user.username}</h6>
                        <small>${user.bio || "No bio yet"} · ${user.postCount || 0} posts</small>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error(err);
    }
}

function logout() {
    preventBackNavigation();
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    window.location.href = 'signing.html';
}

function preventBackNavigation() {
    window.history.replaceState(null, null, window.location.href);
    window.history.pushState(null, null, window.location.href);

    window.onpopstate = function() {
        window.history.go(1);
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Your session has been terminated after logout.',
            confirmButtonText: 'OK'
        });
    };
}

