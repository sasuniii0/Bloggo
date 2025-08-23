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

    const postData = {
        title: title,
        content: content,
        status: 'PUBLISHED',
        userId: 1 // replace dynamically with logged-in user's ID
    };

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

editor.addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    setSavingStatus();
});

window.onload = function() { editor.focus(); };