import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth ,GoogleAuthProvider,signInWithPopup} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use

    const firebaseConfig = {
    apiKey: "AIzaSyAM0xU7gxXOL9FksMN9cT7KLzewy2KcMyA",
    authDomain: "bloggo-6430d.firebaseapp.com",
    projectId: "bloggo-6430d",
    storageBucket: "bloggo-6430d.firebasestorage.app",
    messagingSenderId: "557859559257",
    appId: "1:557859559257:web:f53173bcc734fb6a2a9e48"
};

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    auth.languageCode = 'en'

    const provider = new GoogleAuthProvider();

    const google = document.getElementById("google-auth");
    google.addEventListener("click",async function (){
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;

                // Get Firebase token
                const idToken = await user.getIdToken();

                // Send Firebase token to backend
                const response = await fetch("http://localhost:8080/auth/google", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`
                    }
                });

                const data = await response.json();

                // ✅ Store your backend JWT
                sessionStorage.setItem("jwt", data.jwt);

                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                console.error("Error:", error);
            });

    })