const editor = document.getElementById('editor');
const autosave = document.getElementById('autosave');
const titleInput = document.querySelector('.form-control');

document.getElementById('btn-publish').addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const content = editor.innerHTML.trim();

    if (!title) {
        alert('Please enter a title for your blog post.');
        titleInput.focus();
        return;
    }
    if (!content || content === '<br>') {
        alert('Please enter some content for your blog post.');
        editor.focus();
        return;
    }
    let coverImageUrl = null;
    const file = coverInput.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = async function(e){
            coverImageUrl = e.target.result;

            const postData = {
                title: title,
                content: content,
                status: 'PUBLISHED',
                coverImageUrl, // ✅ include here
                userId: 1 // replace dynamically with logged-in user's ID
            };

            await sendPost(postData);
        };
        reader.readAsDataURL(file);
    }else{
        const  postData = {
            title,
            content,
            status: 'PUBLISHED',
            userId: 1
        };
        await sendPost(postData);
    }

});

async function sendPost(postData){
    try {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            alert('You must be logged in to publish a post.');
            return;
        }

        const response = await fetch('http://localhost:8080/api/v1/post/publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            alert('✅ Blog post published successfully!');
            titleInput.value = '';
            editor.innerHTML = '<p><br></p>';
            setSavingStatus();
            window.location.href = 'stories.html';
        } else {
            const error = await response.text();
            console.error(error);
            alert('❌ Failed to publish blog post.');
        }
    } catch (err) {
        console.error(err);
        alert('⚠️ Error publishing blog post.');
    }
}

const coverInput = document.getElementById('coverImageInput');
const coverPreview = document.getElementById('coverPreview');

coverInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            coverPreview.src = e.target.result;
            coverPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});


function format(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
}

function insertImage() {
    const url = prompt('Enter image URL:');
    if (url) format('insertImage', url);
}

let timeout;
function setSavingStatus() {
    autosave.classList.add('saving');
    autosave.querySelector('span:last-child').textContent = 'Saving...';
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        autosave.classList.remove('saving');
        autosave.querySelector('span:last-child').textContent = 'All changes saved';
    }, 1000);
}

editor.addEventListener('input', setSavingStatus);
titleInput.addEventListener('input', setSavingStatus);

editor.addEventListener('dragover', e => {
    if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
        editor.classList.add('drop-zone-active');
    }
});
editor.addEventListener('dragleave', e => {
    if (!editor.contains(e.relatedTarget)) editor.classList.remove('drop-zone-active');
});
editor.addEventListener('drop', e => {
    e.preventDefault();
    editor.classList.remove('drop-zone-active');
    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(img);
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    img.parentNode.insertBefore(p, img.nextSibling);
                    range.setStart(p, 0);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    editor.appendChild(img);
                }
                setSavingStatus();
            }
            reader.readAsDataURL(file);
        }
    });
});

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
        document.querySelector(".avatar").src = user.profileImage || "../assets/default.png";
    } catch (err) {
        console.error("Error loading user:", err);
    }
});


editor.addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    setSavingStatus();
});

window.onload = function() { editor.focus(); };

function logout() {
    // Clear stored token and user info
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    // Redirect to login page
    window.location.href = 'login.html';
}