// Example: confirm before banning a user
document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', function () {
        if (!confirm("Are you sure you want to ban this user?")) {
            event.preventDefault();
        }
    });
});

function logout() {
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    preventBackNavigation();

    // Redirect to login page
    window.location.href = 'signing.html';
}

function preventBackNavigation() {
    // Replace current history entry
    window.history.replaceState(null, null, window.location.href);

    // Add new history entry
    window.history.pushState(null, null, window.location.href);

    // Handle back button press
    window.onpopstate = function() {
        window.history.go(1);
        alert("Access denied. Your session has been terminated after logout.");
    };
}

// 🔄 Toggle Action Status
function toggleActionStatus(id, badgeElement) {
    fetch(`http://localhost:8080/api/v1/admin-actions/status/${id}`, {
        method: "PATCH",
        credentials: "include" // in case cookies/session are used
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                const updated = data.data;
                // Update badge text + color instantly in UI
                if (updated.actionType === "ACTIVE") {
                    badgeElement.textContent = "Active";
                    badgeElement.className = "badge bg-success";
                } else {
                    badgeElement.textContent = "Inactive";
                    badgeElement.className = "badge bg-secondary";
                }
            } else {
                alert("Failed to update status!");
            }
        })
        .catch(err => {
            console.error("Error toggling status:", err);
            alert("Server error while toggling status");
        });
}
