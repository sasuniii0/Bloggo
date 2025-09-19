document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter a valid email.'
        });
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorText
            });
            return;
        }

        const result = await response.text();
        Swal.fire({
            icon: 'success',
            title: 'Reset Link Sent',
            text: result + "\nCheck your email for the reset link."
        })

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong. Please try again.'
        });
    }
});