const editor = document.getElementById("editor");
const autosave = document.getElementById("autosave");
const titleInput = document.querySelector(".form-control");
const coverInput = document.getElementById("coverImageInput");
const coverPreview = document.getElementById("coverPreview");
const plusBtn = document.getElementById("plusBtn");
const toolbar = document.querySelector(".toolbar");

let coverImageUrl = null; // 🔑 make global so both file + Unsplash can set this
let timeout;

// -------------------------
// Toolbar toggle
// -------------------------
editor.addEventListener("focus", () => {
    plusBtn.style.display = "block";
});

editor.addEventListener("blur", () => {
    setTimeout(() => {
        plusBtn.style.display = "none";
        toolbar.style.display = "none";
    }, 200);
});

plusBtn.addEventListener("click", () => {
    toolbar.style.display =
        toolbar.style.display === "flex" ? "none" : "flex";
});

document.getElementById("btn-draft").addEventListener("click", async () => {
    await submitPost("DRAFT");
});

const scheduleBtn = document.getElementById("btn-schedule");
const confirmBtn = document.getElementById("confirmScheduleBtn");
const scheduleInput = document.getElementById("scheduleDateTime");
const scheduleModal = new bootstrap.Modal(document.getElementById('scheduleModal'));

scheduleBtn.addEventListener("click", () => {
    // Open the modal
    scheduleModal.show();
});

confirmBtn.addEventListener("click", async () => {
    const scheduledTime = scheduleInput.value;
    if (!scheduledTime) {
        Swal.fire({
            icon: 'warn',
            title: 'Required All Fields',
            text: 'Please select a date and time!',
        });
        return;
    }

    // Call your submit function
    await submitPost("SCHEDULED", scheduledTime);

    // Close the modal
    scheduleModal.hide();
});


document.getElementById("btn-publish").addEventListener("click", async () => {
    await submitPost("PUBLISHED");
});

async function submitPost(status, scheduledAt = null) {
    const title = titleInput.value.trim();
    const content = editor.innerHTML.trim();

    if (!title) {
        Swal.fire({
            icon: 'warn',
            title: ' Required All Fields',
            text: 'Enter a title',
        });
        return;
    }
    if (!content || content === "<br>") {
        Swal.fire({
            icon: 'warn',
            title: ' Required All Fields',
            text: 'Enter a content',
        });
        return; }

    const postData = {
        title,
        content,
        status,
        coverImageUrl,
        scheduledAt, // null for draft/publish
        userId: 1 // replace with logged-in user
    };

    try {
        const token = sessionStorage.getItem("jwtToken");
        const endpoint = status === "DRAFT" ? "draft" :
            status === "SCHEDULED" ? "schedule" : "publish";

        const response = await fetch(`http://localhost:8080/api/v1/post/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: `Post ${status.toLowerCase()} successfully!`,
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                titleInput.value = "";
                editor.innerHTML = "<p><br></p>";
                window.location.href = "stories.html";
            });
        } else {
            const err = await response.text();
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: `Failed to ${status.toLowerCase()} post`,
                text: err || "An unknown error occurred."
            });
        }

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'warning',
            title: `Error while ${status.toLowerCase()} post `,
            text: err.message || "Something went wrong. Please try again.",
        });
    }
}


/*

// -------------------------
// Publish handler
// -------------------------
document.getElementById("btn-publish").addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const content = editor.innerHTML.trim();

    if (!title) {
        alert("Please enter a title for your blog post.");
        titleInput.focus();
        return;
    }
    if (!content || content === "<br>") {
        alert("Please enter some content for your blog post.");
        editor.focus();
        return;
    }

    const file = coverInput.files[0];
    if (file) {
        // file upload selected
        const reader = new FileReader();
        reader.onload = async function (e) {
            coverImageUrl = e.target.result;
            const postData = {
                title,
                content,
                status: "PUBLISHED",
                coverImageUrl,
                userId: 1, // TODO: replace with logged-in user's ID
            };
            await sendPost(postData);
        };
        reader.readAsDataURL(file);
    } else {
        // Unsplash or no cover
        const postData = {
            title,
            content,
            status: "PUBLISHED",
            coverImageUrl,
            userId: 1,
        };
        await sendPost(postData);
    }
});
*/

// -------------------------
// Send post to backend
// -------------------------
async function sendPost(postData) {
    try {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'You must be logged in to publish a post.',
                confirmButtonText: 'OK'
            });
            return;
        }


        const response = await fetch("http://localhost:8080/api/v1/post/publish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '✅ Blog post published successfully!',
                showConfirmButton: false,
                timer: 2000
            });
            titleInput.value = "";
            editor.innerHTML = "<p><br></p>";
            setSavingStatus();
            window.location.href = "stories.html";
        } else {
            const error = await response.text();
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: '❌ Failed to publish blog post',
                text: error || 'Something went wrong. Please try again.'
            });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'warning',
            title: '⚠️ Error publishing blog post',
            text: err.message || 'Unexpected error occurred.'
        });
    }

}

// -------------------------
// Cover file preview
// -------------------------
coverInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            coverPreview.src = e.target.result;
            coverPreview.style.display = "block";
            coverImageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// -------------------------
// Formatting + saving
// -------------------------
function format(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
}

function insertImage() {
    const url = prompt("Enter image URL:");
    if (url) format("insertImage", url);
}

function setSavingStatus() {
    autosave.classList.add("saving");
    autosave.querySelector("span:last-child").textContent = "Saving...";
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        autosave.classList.remove("saving");
        autosave.querySelector("span:last-child").textContent =
            "All changes saved";
    }, 1000);
}

editor.addEventListener("input", setSavingStatus);
titleInput.addEventListener("input", setSavingStatus);

// -------------------------
// Drag-drop images
// -------------------------
editor.addEventListener("dragover", (e) => {
    if (e.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        editor.classList.add("drop-zone-active");
    }
});
editor.addEventListener("dragleave", (e) => {
    if (!editor.contains(e.relatedTarget))
        editor.classList.remove("drop-zone-active");
});
editor.addEventListener("drop", (e) => {
    e.preventDefault();
    editor.classList.remove("drop-zone-active");
    const files = e.dataTransfer.files;
    Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(img);
                    const p = document.createElement("p");
                    p.innerHTML = "<br>";
                    img.parentNode.insertBefore(p, img.nextSibling);
                    range.setStart(p, 0);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    editor.appendChild(img);
                }
                setSavingStatus();
            };
            reader.readAsDataURL(file);
        }
    });
});

// -------------------------
// Unsplash integration
// -------------------------
const UNSPLASH_ACCESS_KEY = "";

// Open modal
function openUnsplashModal() {
    const searchBox = document.getElementById("unsplashSearch");
    searchBox.value = "";
    document.getElementById("unsplashResults").innerHTML = "";
    const modal = new bootstrap.Modal(
        document.getElementById("unsplashModal")
    );
    modal.show();
}

// Search Unsplash
document
    .getElementById("unsplashSearch")
    .addEventListener("input", async (e) => {
        const query = e.target.value.trim();
        if (!query) return;

        const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&per_page=12`,
            {
                headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
            }
        );
        const data = await res.json();

        const container = document.getElementById("unsplashResults");
        container.innerHTML = "";
        data.results.forEach((img) => {
            const wrapper = document.createElement("div");
            wrapper.className = "unsplash-result";

            const imgEl = document.createElement("img");
            imgEl.src = img.urls.small;
            imgEl.className = "img-thumbnail mb-2";
            imgEl.style.cursor = "pointer";
            imgEl.onclick = () => insertUnsplashImage(img);

            const coverBtn = document.createElement("button");
            coverBtn.className = "btn btn-sm btn-secondary w-100";
            coverBtn.textContent = "Set as Cover";
            coverBtn.onclick = () => setUnsplashCover(img);

            wrapper.appendChild(imgEl);
            wrapper.appendChild(coverBtn);
            container.appendChild(wrapper);
        });
    });

// Set cover from Unsplash
function setUnsplashCover(img) {
    coverPreview.src = img.urls.regular;
    coverPreview.style.display = "block";
    coverImageUrl = img.urls.regular;
    bootstrap.Modal.getInstance(
        document.getElementById("unsplashModal")
    ).hide();
}

// Insert into editor
function insertUnsplashImage(img) {
    const imageEl = document.createElement("img");
    imageEl.src = img.urls.regular;
    imageEl.alt = img.alt_description || "Unsplash Image";

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(imageEl);
        range.collapse(false);
    } else {
        editor.appendChild(imageEl);
    }

    // Add attribution
    const credit = document.createElement("p");
    credit.innerHTML = `Photo by <a href="${img.user.links.html}" target="_blank">${img.user.name}</a> on <a href="https://unsplash.com" target="_blank">Unsplash</a>`;
    editor.appendChild(credit);

    setSavingStatus();
    bootstrap.Modal.getInstance(
        document.getElementById("unsplashModal")
    ).hide();
}

// -------------------------
// Paste plain text only
// -------------------------
editor.addEventListener("paste", (e) => {
    e.preventDefault();
    const text =
        (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
    setSavingStatus();
});

// -------------------------
// Load user avatar
// -------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;
    try {
        const res = await fetch("http://localhost:8080/user/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load user");
        const user = await res.json();
        document.querySelector(".avatar").src =
            user.profileImage || "../assets/default.png";
    } catch (err) {
        console.error("Error loading user:", err);
    }
});

// -------------------------
// Logout + prevent back nav
// -------------------------
function logout() {
    preventBackNavigation();
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    window.location.href = "signing.html";
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

window.onload = function () {
    editor.focus();
};
