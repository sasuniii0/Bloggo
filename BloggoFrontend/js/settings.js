document.addEventListener("DOMContentLoaded", () => {
    // Smooth scroll for sidebar links
    const links = document.querySelectorAll('.settings-sidebar a');
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");
    const profileForm = document.querySelector("#profile form");

    // Preview avatar when clicked
    avatarPreview.addEventListener("click", () => avatarInput.click());

    // Show selected image preview
    let profileImageBase64 = null; // ✅ define globally

    avatarInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                avatarPreview.src = e.target.result;
                profileImageBase64 = e.target.result; // ✅ save Base64
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle profile form submit
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const bio = document.getElementById("bio").value;

        const payload = {
            username,
            email,
            bio,
            profileImage: profileImageBase64 // can be null
        };

        console.log(payload)

        const token = sessionStorage.getItem("jwtToken");
        const userId = sessionStorage.getItem("userId");

        try {
            const response = await fetch(`http://localhost:8080/user/profileUpdate/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Safely parse JSON
                const text = await response.text();  // get raw text
                let updatedUser = {};
                try {
                    updatedUser = text ? JSON.parse(text) : {};
                } catch (parseErr) {
                    console.warn("Server returned invalid JSON:", text);
                    updatedUser = {}; // fallback
                }

                avatarPreview.src = updatedUser.profileImage || "../assets/boy%20(1).png";
                alert("✅ Profile updated successfully!");
                window.location.href= "settings.html";
            } else if (response.status === 403) {
                alert("❌ Unauthorized: Please log in again.");
                window.location.href = "signing.html";
            } else {
                alert("❌ Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("⚠️ An error occurred.");
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
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    const loading = document.getElementById("loading");

    // Show loading
    loading.style.display = "flex";

    // Hide loading
    loading.style.display = "none";


    try {
        const res = await fetch("http://localhost:8080/user/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load user");

        const user = await res.json();

        // Populate navbar avatar
        const avatar = document.querySelector(".avatar");
        if (avatar) avatar.src = user.profileImage || "../assets/boy%20(1).png";

        // Populate settings form inputs
        const usernameInput = document.getElementById("username");
        const emailInput = document.getElementById("email");
        const bioInput = document.getElementById("bio");
        const avatarPreview = document.getElementById("avatarPreview");

        if (usernameInput) usernameInput.value = user.username || "";
        if (emailInput) emailInput.value = user.email || "";
        if (bioInput) bioInput.value = user.bio || "";
        if (avatarPreview) avatarPreview.src = user.profileImage || "../assets/boy%20(1).png";

    } catch (err) {
        console.error("Error loading user:", err);
        alert("Failed to load user data.");
    } finally {
        if (loading) loading.style.display = "none"; // Hide loading
    }
});

