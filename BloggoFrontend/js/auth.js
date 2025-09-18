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
        signInWithPopup(auth,provider)
            .then((result) =>{
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const user = result.user;
                console.log(user)
                window.location.href = "dashboard.html"
            }).catch((error) =>{
                const errorCode = error.code;
                const errorMessage = error.message;
        })
    })