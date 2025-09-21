let stompClient = null;
const userId = sessionStorage.getItem("userId"); // Make sure this exists
let idleTimeout = null;
let lastStatusSent = 0;

// Connect to WebSocket
function connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Disable debug logs for performance

    stompClient.connect({}, frame => {
        console.log('Connected:', frame);

        sendStatus("ONLINE");   // Initial online status
        startIdleTimer();       // Start idle detection

        // Event listeners for activity
        document.addEventListener("mousemove", resetIdle);
        document.addEventListener("keydown", resetIdle);

        // Subscribe to single-user updates
        stompClient.subscribe('/topic/status', message => {
            const user = JSON.parse(message.body); // Single user object
            updateSingleUserStatus(user);
        });
    });
}

// Send status to server
function sendStatus(status = "ONLINE") {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/status", {}, JSON.stringify({ userId, status }));
    }
}

// Throttled sending to prevent flooding server
function sendStatusThrottled() {
    const now = Date.now();
    if (now - lastStatusSent > 3000) { // 3 seconds throttle
        sendStatus("ONLINE");
        lastStatusSent = now;
    }
}

// Idle timer
function startIdleTimer() {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
        sendStatus("IDLE"); // Mark user as idle after 5 mins
    }, 5 * 60 * 1000);
}

// Reset idle timer and mark user ONLINE (throttled)
function resetIdle() {
    startIdleTimer();
    sendStatusThrottled();
}

// Update only the affected user's DOM
function updateSingleUserStatus(user) {
    // Update profile dot if current user
    if (user.userId == userId) {
        const profileDot = document.getElementById("profile-status-dot");
        if (profileDot) {
            profileDot.style.backgroundColor =
                user.status === "ONLINE" ? "green" :
                    user.status === "IDLE" ? "orange" : "gray";
        }
    }

    // Update online-users list efficiently
    const container = document.getElementById("online-users");
    if (container) {
        let userDiv = document.getElementById(`user-${user.userId}`);
        if (!userDiv) {
            userDiv = document.createElement('div');
            userDiv.id = `user-${user.userId}`;
            userDiv.innerHTML = `<span class="status-dot">●</span> ${user.username}`;
            container.appendChild(userDiv);
        }
        const dot = userDiv.querySelector('.status-dot');
        dot.style.color =
            user.status === "ONLINE" ? "green" :
                user.status === "IDLE" ? "orange" : "gray";
    }
}

// Initialize connection on page load
connect();
