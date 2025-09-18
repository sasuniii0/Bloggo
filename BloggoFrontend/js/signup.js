const api = "http://localhost:8080/auth";


// Profile image upload preview
const profileUpload = document.getElementById('profile-upload');
const profilePreview = document.getElementById('profile-preview');

let base64Image = ""; // store Base64

/*profileUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            base64Image = event.target.result; // store image as Base64
            profilePreview.src = base64Image;
        };
        reader.readAsDataURL(file);
    }
});*/

// Signup form submission
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const userDTO = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        /*bio: document.getElementById('bio').value.trim(),
        profileImage: base64Image // send Base64 string*/
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
            Swal.fire({
                icon: 'success',
                title: 'Sign Up Successful',
                text: 'Now you can log in.',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = 'signing.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Signup Failed',
                text: `Signup failed: ${result.message || 'Unknown error'}`,
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error("Signup error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error during signup. Check console for details.',
            confirmButtonText: 'OK'
        });
    }

});

// OAuth button handlers
document.getElementById('google-auth').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'OAuth',
        text: 'Google OAuth would be implemented here',
        confirmButtonText: 'OK'
    });
});

document.getElementById('facebook-auth').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'OAuth',
        text: 'Facebook OAuth would be implemented here',
        confirmButtonText: 'OK'
    });
});

document.getElementById('linkedin-auth').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'OAuth',
        text: 'LinkedIn OAuth would be implemented here',
        confirmButtonText: 'OK'
    });
});

