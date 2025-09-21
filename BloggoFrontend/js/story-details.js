document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const token = sessionStorage.getItem("jwtToken");
    let loggedInUser = sessionStorage.getItem("username");

    if (!postId) {
        Swal.fire({
            icon: 'warning',
            title: 'Story Not Found',
            text: ' Story not found',
            confirmButtonText: 'OK'
        });
        return;
    }


    await loadLoggedUser();
    await loadCurrentUser(token)

    let utterance = null; // Keep reference to current speech

// Listen button
    document.getElementById("listen-btn").addEventListener("click", () => {
        const postText = document.getElementById("storyContent").innerText;

        if (!postText.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Story Not Found',
                text: ' No story content to read.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Stop any current speech
        window.speechSynthesis.cancel();

        // Create a new speech utterance
        utterance = new SpeechSynthesisUtterance(postText);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    });

// Pause button
    document.getElementById("pause-btn").addEventListener("click", () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            console.log("⏸️ Speech paused");
        }
    });

// Resume button
    document.getElementById("resume-btn").addEventListener("click", () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            console.log("▶️ Speech resumed");
        }
    });



    /*document.getElementById("listen-btn").addEventListener("click", async () => {
        const postText = document.getElementById("storyContent").innerText;
        const audioPlayer = document.getElementById("ttsAudio");
        const apiKey = "";

        // Using CORS proxy (for testing/demo purposes)
        const proxy = "https://cors-anywhere.herokuapp.com/";
        const url = `${proxy}https://api.voicerss.org/?key=${apiKey}&hl=en-us&c=MP3&f=44khz_16bit_stereo&src=${encodeURIComponent(postText)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("TTS request failed");

            const audioBlob = await response.blob();
            audioPlayer.src = URL.createObjectURL(audioBlob);
            audioPlayer.style.display = "block";
            audioPlayer.play();
        } catch (err) {
            alert("❌ Error generating audio: " + err.message);
        }
    });
*/

    // ============================
// Load Current User for Avatar
// ============================
    async function loadCurrentUser(token) {
        try {
            const res = await fetch("http://localhost:8080/user/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to load user");
            const user = await res.json();
            const avatar = document.querySelector(".avatar");
            if (avatar) avatar.src = user.profileImage || "../assets/default.png";
        } catch (err) {
            console.error("Error loading user:", err);
        }
    }

    loggedInUser = sessionStorage.getItem("username"); // refresh after loadLoggedUser

    // --- DOM Elements ---
    const titleEl = document.getElementById("storyTitle");
    const authorNameEl = document.getElementById("authorName");
    const publishDateEl = document.getElementById("publishDate");
    const storyImageEl = document.getElementById("storyImage");
    const contentEl = document.getElementById("storyContent");
    const actionsEl = document.getElementById("story-actions");
    const boostBtn = document.getElementById("boostBtn");
    const boostCountEl = document.getElementById("boostCount");
    const commentsList = document.getElementById("commentsList");
    const commentsCountEl = document.getElementById("commentsCount");
    const bookmarkBtn = document.getElementById("bookmarkBtn");

    const editForm = document.getElementById("editForm");
    const editTitle = document.getElementById("editTitle");
    const editContent = document.getElementById("editContent");
    const coverInput = document.getElementById("coverPicture");
    const coverPreview = document.getElementById("coverPreview");

    const downloadPdfBtn = document.getElementById("downloadPdfBtn");

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            downloadPdf(postId);
        });
    }

    function downloadPdf(postId) {
        window.open(`http://localhost:8080/api/v1/pdf/download-pdf/${postId}`, "_blank");
    }


    if (!token) {
        titleEl.textContent = " Please log in to view the story.";
        return;
    }

    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "flex";

    // --- Fetch JSON with Auth ---
    const fetchJSON = async (url, options = {}) => {
        options.headers = options.headers || {};
        if (!options.headers["Authorization"]) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(url, options);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw data;
        return data;
    };

    let currentPost = null;

    // --- Load Post ---
    try {
        const data = await fetchJSON(`http://localhost:8080/api/v1/dashboard/post/${postId}`);
        const post = data.data;
        currentPost = post;

        // Render post info
        titleEl.textContent = post.title || "Untitled";
        authorNameEl.textContent = post.username || "Unknown";
        publishDateEl.textContent = new Date(post.publishedAt).toLocaleDateString();
        contentEl.innerHTML = post.content || "No content available.";

        const coverUrl = post.imageUrl || "";
        storyImageEl.src = coverUrl;
        coverPreview.src = coverUrl;
        coverPreview.style.display = coverUrl ? "block" : "none";

        // Author clickable → members page
        authorNameEl.style.cursor = "pointer";
        authorNameEl.addEventListener("click", () => {
            window.location.href = `../pages/members-profile.html?username=${encodeURIComponent(post.username)}`;
        });

        // Show Edit/Delete buttons if author
        if (loggedInUser && loggedInUser === post.username) createPostActions();

        // Prefill edit modal
        editTitle.value = post.title;
        editContent.value = post.content;

        function updateBoostUI() {
            const hasBoosted = currentPost.boostedByCurrentUser;
            boostCountEl.textContent = currentPost.boostCount || 0;

            if (hasBoosted) {
                boostBtn.classList.add("active", "boost-btn");
                boostBtn.disabled = true;
                boostCountEl.innerHTML += " Boosted";
            } else {
                boostBtn.classList.remove("active");
                boostBtn.classList.add("boost-btn");
                boostBtn.disabled = false;
                boostCountEl.innerHTML += " Boost";
            }
        }

        updateBoostUI();

        // Load comments
        await loadComments();

    } catch (err) {
        console.error("Error loading post:", err);
        titleEl.textContent = " Error loading story.";
    } finally {
        if (loading) loading.style.display = "none";
    }

    // --- Cover Input Preview ---
    coverInput.addEventListener("change", () => {
        const file = coverInput.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            coverPreview.src = previewUrl;
            coverPreview.style.display = "block";
            storyImageEl.src = previewUrl;
        } else {
            coverPreview.src = currentPost.imageUrl || "";
            coverPreview.style.display = currentPost.imageUrl ? "block" : "none";
            storyImageEl.src = currentPost.imageUrl || "";
        }
    });

    // --- Create Edit/Delete buttons ---
    function createPostActions() {
        const editBtn = document.createElement("button");
        editBtn.className = "action-btn edit-btn";
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.setAttribute("data-bs-toggle", "modal");
        editBtn.setAttribute("data-bs-target", "#editModal");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "action-btn delete-btn";
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = async () => {
            // Show SweetAlert confirmation
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you really want to delete this post?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#FF6F61',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) return; // User clicked cancel
            try {
                await fetchJSON(`http://localhost:8080/api/v1/post/delete/${postId}`, { method: "DELETE" });

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    text: ' Post deleted successfully!',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = "stories.html";
                });

            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Deletion Failed',
                    text: ` ${err.message || "Failed to delete post"}`,
                    confirmButtonText: 'OK'
                });
            }

        };

        actionsEl.append(editBtn, deleteBtn);
    }



    // --- Edit Form Submission ---
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        let coverImageUrl = currentPost.imageUrl;
        const file = coverInput.files[0];

        if (file) {
            coverImageUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = err => reject(err);
                reader.readAsDataURL(file);
            });
        }

        const payload = {
            title: editTitle.value,
            content: editContent.value,
            coverImageUrl,
            status: "PUBLISHED"
        };

        try {
            const res = await fetch(`http://localhost:8080/api/v1/post/edit/${postId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Post Updated',
                    text: 'Post updated successfully!',
                    confirmButtonText: 'OK'
                }).then(() => {
                    location.reload();
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: ` ${errData.message || res.status}`,
                    confirmButtonText: 'OK'
                });
            }
        } catch (err) {
            console.error("Edit failed:", err);
            Swal.fire({
                icon: 'warning',
                title: 'Error',
                text: '⚠️ Error updating post',
                confirmButtonText: 'OK'
            });
        }

    });

    // --- Bookmark button logic ---
    async function updateBookmarkButton() {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Save';
            return;
        }

        try {
            // Check initial bookmark status
            const checkResponse = await fetch(`http://localhost:8080/api/v1/bookmarks/check/${postId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            let checkData;
            try {
                checkData = await checkResponse.json();
            } catch {
                console.warn("Check bookmark response is not JSON:", await checkResponse.text());
                return;
            }

            const isBookmarked = checkData.data;
            bookmarkBtn.innerHTML = isBookmarked
                ? '<i class="fas fa-bookmark"></i> Saved'
                : '<i class="far fa-bookmark"></i> Save';

        } catch (err) {
            console.error("Error checking bookmark:", err);
        }
    }

// Call once on page load
    await updateBookmarkButton();

// Toggle bookmark on click
    bookmarkBtn.addEventListener("click", async () => {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Not Logged In',
                text: ' Please log in to save bookmarks.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/v1/bookmarks/toggle/${postId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const text = await response.text(); // Read raw response first
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                console.warn("Bookmark toggle response not JSON:", text);
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Data',
                    text: 'Backend returned invalid data.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (response.ok && data.status === 200) {
                const isBookmarked = data.data;
                bookmarkBtn.innerHTML = isBookmarked
                    ? '<i class="fas fa-bookmark"></i> Saved'
                    : '<i class="far fa-bookmark"></i> Save';
            } else {
                console.error("Failed toggle response:", data);
                Swal.fire({
                    icon: 'error',
                    title: 'Toggle Failed',
                    text: 'Failed to toggle bookmark',
                    confirmButtonText: 'OK'
                });
            }

        } catch (err) {
            console.error("Toggle bookmark failed:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error toggling bookmark',
                confirmButtonText: 'OK'
            });
        }

    });

    // --- Boost Button ---
    boostBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/boost/${postId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            currentPost.boostCount = data.data.boostCount;
            currentPost.boostedByCurrentUser = data.data.boostedByCurrentUser;

            updateBoostUI();
        } catch (err) {
            console.error("Boost failed:", err);
            Swal.fire({
                icon: 'error',
                title: 'Boost Failed',
                text: 'Boost failed! Make sure you are logged in.',
                confirmButtonText: 'OK'
            });
        }

    });

    // --- Load Comments ---
    async function loadComments() {
        try {
            const data = await fetch(`http://localhost:8080/api/v1/comment/${postId}`).then(r => r.json());
            const comments = data.data || [];
            commentsCountEl.textContent = comments.length;
            commentsList.innerHTML = comments.length
                ? comments.map(c => `
                    <div class="comment d-flex gap-2 align-items-start mb-2">
                        <img src="${c.profileImage || '../assets/default.png'}" 
                             alt="Profile" 
                             class="rounded-circle" 
                             style="width:40px;height:40px;object-fit:cover;">
                        <div class="comment-content">
                            <div class="comment-header d-flex justify-content-between">
                                <div class="fw-semibold">${c.userId || 'Anonymous'}</div>
                                <div class="small text-muted">${new Date(c.createdAt).toLocaleDateString()}</div>
                            </div>
                            <p class="mb-0">${c.content}</p>
                        </div>
                    </div>
                `).join("")
                : "<div class='text-center py-3 text-muted'>No comments yet.</div>";

        } catch (err) {
            console.error("Load comments failed:", err);
            commentsList.innerHTML = "<div class='text-center py-3 text-muted'>Error loading comments</div>";
        }
    }

    // --- Add Comment ---
    document.getElementById("addCommentBtn").addEventListener("click", async () => {
        const commentInput = document.getElementById("commentInput");
        const content = commentInput.value.trim();
        if (!content) {
            Swal.fire({
                icon: 'warning',
                title: 'Empty Content',
                text: 'Please write something',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const payload = { content };
            const response = await fetch(`http://localhost:8080/api/v1/comment/post/${postId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            commentInput.value = "";
            await loadComments();
        } catch (err) {
            console.error("Post comment failed:", err);
            Swal.fire({
                icon: 'error',
                title: 'Comment Failed',
                text: 'Failed to post comment. Please try again.',
                confirmButtonText: 'OK'
            });
        }

    });

    /*const listenBtn = document.getElementById("listen-btn");

    listenBtn.addEventListener("click", async () => {
        try {
            const storyText = document.getElementById("storyContent").innerText.trim();

            if (!storyText) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Empty Story',
                    text: '⚠️ Story content is empty!',
                    confirmButtonText: 'OK'
                });
                return;
            }


            // Disable button and show loading
            listenBtn.disabled = true;
            listenBtn.innerText = "🎧 Loading...";

            const response = await fetch("https://n8n.cenzios.com/webhook/generate-voice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ voice_id: "Xb7hH8MSUJpSbSDYk0k2", text: storyText })
            });

            if (!response.ok) throw new Error(`TTS request failed with status ${response.status}`);

            // Convert the response stream to a Blob (audio)
            const audioBlob = await response.blob();

            if (!audioBlob || audioBlob.size === 0) {
                throw new Error("TTS service returned empty audio.");
            }

            // Play the audio
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();

        } catch (err) {
            console.error("TTS failed:", err);
            Swal.fire({
                icon: 'error',
                title: 'Text-to-Speech Failed',
                text: `❌ Failed to generate voice: ${err.message}`,
                confirmButtonText: 'OK'
            });
        }
        finally {
            // Restore button state
            listenBtn.disabled = false;
            listenBtn.innerText = "🔊 Listen to this post";
        }
    });*/


    /*const apiKey = ""; // Replace with your key

// 1️⃣ Get available voices
    async function getAvailableVoices() {
        try {
            const res = await fetch("https://client.camb.ai/apis/list-voices", {
                headers: { "x-api-key": apiKey }
            });
            if (!res.ok) throw new Error("Failed to fetch voices");
            const voices = await res.json();
            console.log("Available voices:", voices);
            return voices;
        } catch (err) {
            console.error("Error fetching voices:", err);
            return [];
        }
    }

// 2️⃣ Convert text to speech using a selected voice
    async function speakText(text, voiceId) {
        try {
            const payload = {
                text: text,
                voice_id: voiceId,      // Pick from available voices
                language: 1,            // 1 = English
                project_name: "Bloggo TTS"
            };

            const res = await fetch("https://client.camb.ai/apis/tts", {
                method: "POST",
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            console.log("CAMB TTS response:", result);

            if (!result.task_id) {
                throw new Error("No task_id returned. Check your request parameters.");
            }

            // CAMB returns the TTS audio as a task you can fetch or monitor
            alert("TTS task created successfully! Task ID: " + result.task_id);
        } catch (err) {
            console.error("Error calling CAMB TTS:", err);
        }
    }

// 3️⃣ Example usage
    await (async () => {
        const voices = await getAvailableVoices();
        if (voices.length === 0) return;

        // Pick first available voice (or filter for gender/language)
        const selectedVoiceId = voices[0].id;

        // Example: convert a story text
        const storyText = document.getElementById("storyContent").innerText || "No content found.";
        await speakText(storyText, selectedVoiceId);
    })();*/

});
async function generateSummary() {
    const storyDiv = document.getElementById('storyContent');
    const summaryText = document.getElementById('summaryText');
    const text = storyDiv.innerText.trim();

    if (!text) {
        alert("Please add some content to summarize!");
        return;
    }

    // Show loading indicator
    summaryText.innerText = " Generating summary...";

    const token = sessionStorage.getItem("jwtToken");

    try {
        const response = await fetch('http://localhost:8080/api/v1/summary', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        console.log(response)

        if (!response.ok) {
            throw new Error("Failed to generate summary. Status: " + response.status);
        }

        const data = await response.json();
        summaryText.innerText = data.summery || "Could not generate summary";
    } catch (err) {
        console.error(err);
        summaryText.innerText = "Error: " + err.message;
    }
}





function logout() {
    preventBackNavigation();
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    window.location.href = 'signing.html';
}
function preventBackNavigation() {
    window.history.replaceState(null, null, window.location.href);

    window.history.pushState(null, null, window.location.href);

    window.onpopstate = function () {
        window.history.go(1);
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Your session has been terminated after logout.',
            confirmButtonText: 'OK'
        });
    };
}

async function loadLoggedUser() {
    const token = sessionStorage.getItem("jwtToken");
    try {
        const res = await fetch(`http://localhost:8080/user/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const user = await res.json();

        if (res.ok) {
            // Avatar
            document.querySelector(".avatar").src = user.profileImage || "../assets/default.png";
            document.getElementById("userAvatar").src = user.profileImage || "../assets/default.png";

            // Navbar username
            if (document.getElementById("navbarUsername")) {
                document.getElementById("navbarUsername").textContent = user.username;
            }

            // Save for later
            sessionStorage.setItem("username", user.username);
            sessionStorage.setItem("userId", user.id);
        } else {
            document.querySelector(".avatar").src = "../assets/default.png";
        }
    } catch (err) {
        console.error("Failed to load user:", err);
        document.querySelector(".avatar").src = "../assets/default.png";
    }
}
