document.addEventListener("DOMContentLoaded", () => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid token',
            text: 'Missing or invalid token.',
            confirmButtonText: 'Go Back'
        }).then(() => {
            window.location.href = "forgot-password.html";
        });
        return;
    }

    document.getElementById("resetForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!newPassword || !confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Please fill in all fields.'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Mismatch',
                text: 'Passwords do not match.'
            });
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword })
            });

            const result = await response.text();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password reset successfully! You can now sign in.',
                    confirmButtonText: 'Go to Sign In'
                }).then(() => {
                    window.location.href = "signing.html";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong. Please try again.'
            });
        }
    });
});