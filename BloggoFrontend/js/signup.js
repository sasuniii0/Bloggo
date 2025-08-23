const api = "http://localhost:8080/auth";

document.getElementById('year').textContent = new Date().getFullYear();

// Profile image upload preview
const profileUpload = document.getElementById('profile-upload');
const profilePreview = document.getElementById('profile-preview');

profileUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            profilePreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userDTO = {
        pic: document.getElementById('profile-upload').value.trim(),
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        bio: document.getElementById('bio').value.trim()
    }
    console.log(userDTO)

    try {
        const response = await fetch(`${api}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userDTO)
        });
        const result = await response.json()
        console.log('Response', result)

        if (response.ok){
            alert('Sign up Successful! now you can signing')
            window.location.href='signing.html';
        }else{
            alert(`Signup Failed: ${result.message || 'Unknown Error'}`)
        }
    }catch (error){
        console.error(error);
        alert("Error during signup");
    }

});

// OAuth button handlers
document.getElementById('google-auth').addEventListener('click', () => {
    alert('Google OAuth would be implemented here');
    // Implement Google OAuth flow
});

document.getElementById('facebook-auth').addEventListener('click', () => {
    alert('Facebook OAuth would be implemented here');
    // Implement Facebook OAuth flow
});

document.getElementById('linkedin-auth').addEventListener('click', () => {
    alert('LinkedIn OAuth would be implemented here');
    // Implement LinkedIn OAuth flow
});


/* const formData = new FormData();
    formData.append('username', document.getElementById('username').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('password', password);
    formData.append('bio', document.getElementById('bio').value);

    // Include profile image if uploaded
    if (profileUpload.files[0]) {
        formData.append('profileImage', profileUpload.files[0]);
    }

    // Here you would typically send the data to your server
    console.log('Form data:', Object.fromEntries(formData));

    // Simulate successful submission
    alert('Account created successfully! Redirecting to dashboard...');
    // window.location.href = 'dashboard.html';*/