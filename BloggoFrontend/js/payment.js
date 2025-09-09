payhere.onCompleted = async function(orderId) {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        alert("You are not logged in!");
        return;
    }

    try {

        const res = await fetch("http://localhost:8080/user/payments/success?userId=" + sessionStorage.getItem("userId"), {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Backend returned " + res.status);

        const data = await res.json();

        if (data.token) {
            sessionStorage.setItem("jwtToken", data.token); // update JWT
            console.log("✅ JWT updated with MEMBER role");
        }

        window.location.href = "stories.html";

    } catch (err) {
        console.error("Error updating membership:", err);
        alert("Payment completed but failed to update your membership. Contact support.");
    }
};


payhere.onDismissed = function() {
    console.log("❌ Payment dismissed");

};

payhere.onError = function(error) {
    console.log("⚠️ Error: " + error);
};

document.getElementById('payhere-payment').onclick = async function () {
    const orderId = "ORDER123";
    const amount = 1500.00;
    const currency = "LKR";

    // 1️⃣ Fetch secure hash from backend
    const res = await fetch("http://localhost:8080/api/v1/payments/generate-hash?orderId="
        + orderId + "&amount=" + amount + "&currency=" + currency, {
        method: "POST"
    });
    const hash = await res.text();

    // 2️⃣ Build payment object
    var payment = {
        "sandbox": true,
        "merchant_id": "",
        "return_url": "http://localhost:8080/api/v1/payments/success",
        "cancel_url": "http://localhost:8080/api/v1/payments/cancel",
        "notify_url": "http://your-public-domain.com/api/v1/payments/notify",
        "order_id": orderId,
        "items": "Test Product",
        "amount": amount.toFixed(2),
        "currency": currency,
        "hash": hash,
        "first_name": "Sasuni",
        "last_name": "Wijerathne",
        "email": "sasuni@example.com",
        "phone": "0712345678",
        "address": "Colombo",
        "city": "Colombo",
        "country": "Sri Lanka"
    };

    // 3️⃣ Start PayHere popup
    payhere.startPayment(payment);
};

// Load logged-in user info for avatar
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:8080/user/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to load user");

        const user = await res.json();

        // Top navbar avatar
        const avatarEl = document.querySelector(".avatar");
        if (avatarEl) avatarEl.src = user.profileImage || "../assets/default.png";

    } catch (err) {
        console.error("Error loading user:", err);
    }
});

// Logout function
function logout() {
    preventBackNavigation();
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    window.location.href = 'signing.html';
}

// Prevent back navigation after logout
function preventBackNavigation() {
    window.history.replaceState(null, null, window.location.href);
    window.history.pushState(null, null, window.location.href);

    window.onpopstate = function() {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}
