let stompClient = null; // global
const userId = sessionStorage.getItem("userId"); // make sure this exists

function connect() {
    // Connect to Spring Boot WebSocket
    const socket = new SockJS('http://localhost:8080/ws');
     stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);

        sendStatus(); // initial online
        // Function to update profile card status
        function updateProfileStatus(user) {
            const dot = document.getElementById("profile-status-dot");
            if (!dot) return;

            let color;
            switch (user.status) {
                case 'ONLINE':
                    color = 'green';
                    break;
                case 'IDLE':
                    color = 'orange';
                    break;
                default:
                    color = 'gray';
            }
            dot.style.backgroundColor = color;
        }


        // Example: update status for logged-in user
        stompClient.subscribe('/topic/status', function(message) {
            const users = JSON.parse(message.body);

            // Update the profile card status
            const currentUser = users.find(u => u.userId == userId);
            if (currentUser) updateProfileStatus(currentUser);

            // Optional: update online-users list
            const container = document.getElementById("online-users");
            container.innerHTML = '';
            users.forEach(user => {
                const dotColor = user.status === 'ONLINE' ? 'green' :
                    user.status === 'IDLE' ? 'orange' : 'gray';
                container.innerHTML += `<div><span style="color:${dotColor}">●</span> ${user.username}</div>`;
            });
        });
        sendStatus();

        // Idle detection
        startIdleTimer();

        document.addEventListener("mousemove", resetIdle);
        document.addEventListener("keydown", resetIdle);
    });
}

function sendStatus() {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/status", {}, userId);
        console.log("Status sent for user:", userId);
    } else {
        console.warn("STOMP client not connected yet");
    }
}


// Idle detection
let idleTimeout;
function startIdleTimer() {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/status", {}, userId); // mark idle
            console.log("User idle:", userId);
        }
    }, 5 * 60 * 1000); // 5 mins
}


// Reset timer on activity
function resetIdle() {
    startIdleTimer();
    sendStatus(); // mark ONLINE again
}

connect();