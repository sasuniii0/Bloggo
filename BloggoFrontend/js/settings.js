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

    // password change
    const passwordForm = document.getElementById("passwordForm");
    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordMessage = document.getElementById("passwordMessage");

    document.getElementById("passwordForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const passwordMessage = document.getElementById("passwordMessage");

        passwordMessage.style.color = "red";

        if (!currentPassword || !newPassword || !confirmPassword) {
            passwordMessage.textContent = "Please fill in all fields.";
            return;
        }

        if (newPassword !== confirmPassword) {
            passwordMessage.textContent = "New password and confirmation do not match.";
            return;
        }

        try {
            const userId = sessionStorage.getItem("userId"); // replace with actual logged-in ID

            const response = await fetch(`http://localhost:8080/api/v1/password/change-password?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.text(); // response is a string message

            if (response.ok) {
                passwordMessage.style.color = "green";
                passwordMessage.textContent = data;
                // clear inputs
                document.getElementById("currentPassword").value = "";
                document.getElementById("newPassword").value = "";
                document.getElementById("confirmPassword").value = "";
            } else {
                passwordMessage.textContent = data;
            }
        } catch (err) {
            console.error(err);
            passwordMessage.textContent = "Something went wrong!";
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
        const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

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

                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: '✅ Profile updated successfully!',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = "settings.html";
                });

            } else if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Unauthorized',
                    text: '❌ Unauthorized: Please log in again.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = "signing.html";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: '❌ Failed to update profile.',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            Swal.fire({
                icon: 'warning',
                title: 'Error',
                text: '⚠️ An error occurred.',
                confirmButtonText: 'OK'
            });
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
    window.onpopstate = function () {
        window.history.go(1);
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Your session has been terminated after logout.',
            confirmButtonText: 'OK'
        });
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
        Swal.fire({
            icon: 'error',
            title: 'Load Failed',
            text: 'Failed to load user data.',
            confirmButtonText: 'OK'
        });
    }
    finally {
        if (loading) loading.style.display = "none"; // Hide loading
    }
});

