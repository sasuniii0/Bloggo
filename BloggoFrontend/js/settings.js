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
    const profileForm = document.querySelector("#profile form"); // profile section form

    // ✅ Preview avatar when clicked
    avatarPreview.addEventListener("click", () => {
        avatarInput.click();
    });

    // ✅ Show selected image preview
    avatarInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => avatarPreview.src = e.target.result;
            reader.readAsDataURL(file);
        }
    });

    // ✅ Handle profile form submit
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("username", document.querySelector("#profile input[type='text']").value);
        formData.append("email", document.querySelector("#profile input[type='email']").value);
        formData.append("bio", document.querySelector("#profile input[type='text'][value='alex']").value);

        if (avatarInput.files[0]) {
            formData.append("profileImage", avatarInput.files[0]);
        }

        try {
            const response = await fetch("http://localhost:8080/user/profileUpdate", {
                method: "POST",
                body: formData,
                headers: {
                    // ✅ attach JWT so Spring Security recognizes user
                    "Authorization": "Bearer " + sessionStorage.getItem("jwtToken")
                }
            });

            if (response.ok) {
                const result = await response.json();
                const updatedUser = result.data;

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
