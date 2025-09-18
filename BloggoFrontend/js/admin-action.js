// Confirm before banning a user
document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', function (event) {
        if (!confirm("Are you sure you want to ban this user?")) {
            event.preventDefault();
        }
    });
});

// Select elements
const broadcastTextarea = document.querySelector('.card-body textarea');
const sendBtn = document.getElementById('btn-send');

// Create a container for status messages
const statusContainer = document.createElement('div');
statusContainer.style.marginTop = '10px';
broadcastTextarea.parentElement.appendChild(statusContainer);

sendBtn.addEventListener('click', async () => {
    const message = broadcastTextarea.value.trim();
    if (!message) {
        statusContainer.innerHTML = '<span style="color: red;">Please write a message before sending.</span>';
        return;
    }

    const broadcastData = {
        title: "Admin Broadcast", // optional dynamic title
        content: message
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/admin-dashboard/broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('jwtToken')
            },
            body: JSON.stringify(broadcastData)
        });

        if (response.ok) {
            statusContainer.innerHTML = '<span style="color: green;">Broadcast sent and emailed to all users!</span>';
            broadcastTextarea.value = ''; // clear textarea
            alert("✅ Broadcast sent successfully!");
        } else {
            const errorData = await response.json();
            const errorMsg = errorData.message || 'Failed to send broadcast.';
            statusContainer.innerHTML = `<span style="color: red;">Error: ${errorMsg}</span>`;
            alert("❌ Error: " + errorMsg);
        }
    } catch (err) {
        console.error('Error sending broadcast:', err);
        statusContainer.innerHTML = '<span style="color: red;">Something went wrong. Check console for details.</span>';
        alert("❌ Something went wrong. Check console for details.");
    }

});


// Logout function
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

// Get JWT token
async function getToken() {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
        alert('No JWT token found, please sign in again.');
        window.location.href = 'signing.html';
        return null;
    }
    return token;
}

// Load dashboard stats dynamically
async function loadDashboardStats() {
    const token = await getToken();
    if (!token) return;

    try {
        // Users, Posts, Boosts, and Comments stats
        const [usersRes, postsRes, boostsRes, commentRes] = await Promise.all([
            fetch('http://localhost:8080/api/v1/admin-dashboard/users/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:8080/api/v1/admin-dashboard/posts/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:8080/api/v1/admin-dashboard/boosts/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:8080/api/v1/admin-dashboard/comments/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
        ]);

        const usersData = await usersRes.json();
        const postsData = await postsRes.json();
        const boostsData = await boostsRes.json();
        const commentsData = await commentRes.json();

        console.log()

        // Update dashboard cards
        document.getElementById('totalUsers').innerText = usersData.total || 0;
        document.getElementById('totalPosts').innerText = postsData.total || 0;
        document.getElementById('totalBoosts').innerText = boostsData.total || 0;
        document.getElementById('totalComments').innerText = commentsData.total || 0;

        // User Growth Chart
        const userCtx = document.getElementById('userGrowthChart').getContext('2d');
        new Chart(userCtx, {
            type: 'line',
            data: {
                labels: usersData.months,
                datasets: [{
                    label: 'New Users',
                    data: usersData.counts,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13,110,253,0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });

       /* // Reports Chart
        const reportsCtx = document.getElementById('reportsChart').getContext('2d');
        new Chart(reportsCtx, {
            type: 'bar',
            data: {
                labels: reportsData.months,
                datasets: [{
                    label: 'Reports',
                    data: reportsData.counts,
                    backgroundColor: 'rgba(255,99,132,0.6)'
                }]
            },
            options: { responsive: true }
        });*/

    } catch (err) {
        console.error("Error loading dashboard stats:", err);
    }
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});
