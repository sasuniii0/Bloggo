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

        try {
            const userId = sessionStorage.getItem("userId"); // ✅ must include ID in path

            console.log(userId)
            const response = await fetch(`http://localhost:8080/user/profileUpdate/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });


            if (response.ok) {
                const updatedUser = await response.json();
                avatarPreview.src = updatedUser.profileImage || "../assets/boy%20(1).png";
                alert("✅ Profile updated successfully!");
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
