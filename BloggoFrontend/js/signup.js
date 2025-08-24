const api = "http://localhost:8080/auth";

document.getElementById('year').textContent = new Date().getFullYear();

// Profile image upload preview
const profileUpload = document.getElementById('profile-upload');
const profilePreview = document.getElementById('profile-preview');

let base64Image = ""; // store Base64

profileUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            base64Image = event.target.result; // store image as Base64
            profilePreview.src = base64Image;
        };
        reader.readAsDataURL(file);
    }
});

// Signup form submission
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const userDTO = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        profileImage: base64Image // send Base64 string
    };

    try {
        const response = await fetch(`${api}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userDTO)
        });

        // Handle empty or non-JSON responses
        let result;
        try {
            result = await response.json();
        } catch {
            result = { message: response.statusText || "No response" };
        }

        if (response.ok) {
            alert('Sign up successful! Now you can log in.');
            window.location.href = 'signing.html';
        } else {
            alert(`Signup failed: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("Error during signup. Check console for details.");
    }
});

// OAuth button handlers
document.getElementById('google-auth').addEventListener('click', () => {
    alert('Google OAuth would be implemented here');
});
document.getElementById('facebook-auth').addEventListener('click', () => {
    alert('Facebook OAuth would be implemented here');
});
document.getElementById('linkedin-auth').addEventListener('click', () => {
    alert('LinkedIn OAuth would be implemented here');
});
