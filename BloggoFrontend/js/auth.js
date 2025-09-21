// 1️⃣ Redirect user to backend Google OAuth2 login
document.getElementById("google-auth").addEventListener("click", () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
});

// 2️⃣ Check if JWT is present in URL after redirect from backend
const token = document.cookie.split('; ').find(row => row.startsWith('jwtToken='))?.split('=')[1];
const username =document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1];


if (token && username) {
    sessionStorage.setItem("jwtToken", token);
    sessionStorage.setItem("username", username);

    // Remove token from URL for cleaner URL (use actual path to dashboard)
    window.history.replaceState({}, document.title, "dashboard.html");

    // Optionally redirect to dashboard if not already there
    if (!window.location.href.includes("dashboard.html")) {
        window.location.href = "/dashboard.html";
    }
}
