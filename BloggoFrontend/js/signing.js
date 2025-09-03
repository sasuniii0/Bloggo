const api = "http://localhost:8080/auth";

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('signing.html') || path.endsWith('/')) {
        const signingForm = document.getElementById('signin-form');

        signingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const authDTO = {
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            console.log(authDTO)
            try {
                const response = await fetch(`${api}/signing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(authDTO)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Login response:', result);

                const data = result.data;
                const token = result.data.accessToken;
                const role = result.data.role;

                console.log('Login response:', result);

                sessionStorage.setItem('jwtToken', token);
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('username', data.username);

                if (data && data.username && data.role) {
                    document.cookie = `jwtToken=${data.accessToken}; path=/; max-age=3600`;
                    sessionStorage.setItem('userRole', data.role);

                    alert("Sign in successful!");
                    if (data.role=== 'ADMIN') {
                        window.location.href = "admin-action.html";
                    } else if (data.role === 'USER') {
                        window.location.href = "dashboard.html";
                    }
                } else {
                    alert('Authentication failed: Token or role not found');
                }

            } catch (err) {
                console.error("Error during sign in:", err);
                alert('Error during sign in.');
            }
        });
    }
});


// OAuth button alerts (placeholder)
document.getElementById('google-auth').addEventListener('click', () => {
    alert('Google OAuth would be implemented here');
});

document.getElementById('facebook-auth').addEventListener('click', () => {
    alert('Facebook OAuth would be implemented here');
});

document.getElementById('linkedin-auth').addEventListener('click', () => {
    alert('LinkedIn OAuth would be implemented here');
});

