const postEndPoint = "http://localhost:8080/api/v1/post";
let currentPage = 0;
const pageSize = 5;

function getToken() {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
        alert('No JWT token found, please sign in again.');
        window.location.href = 'index.html';
    }
    return token;
}

document.addEventListener("DOMContentLoaded", () => {
    loadPosts(1); // Load first page of posts on page load
});

// Load posts from backend
async function loadPosts(page = 1) {
    currentPage = page;
    const token = getToken();
    const postContainer = document.getElementById("postContainer");
    postContainer.innerHTML = `<div class="text-center w-100">Loading posts...</div>`;

    try {
        const res = await fetch(`${postEndPoint}/getAll-pagination?page=${page - 1}&size=${pageSize}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("Fetched posts:", data);
        console.log(data)
        const posts = data?.data?.posts || [];
        const totalPages = data?.data?.totalPages || 1;

        if (!posts.length) {
            postContainer.innerHTML = `<div class="text-center w-100 text-muted">No posts found</div>`;
            renderPagination(0);
            return;
        }

        postContainer.innerHTML = "";
        posts.forEach(post => {
            postContainer.innerHTML += `
        <div class="col-md-4">
            <div class="card h-100 shadow-sm">
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="card-img-top" alt="Post Image" style="height:200px; object-fit:cover;">` : ''}
                <div class="card-body">
                    <h6 class="card-title">@${post.username}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">${post.title || ''}</h6>
                    <p class="card-text text-muted">
                        ${post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                    </p>
                </div>
                <div class="card-footer d-flex justify-content-end">
                    <button class="btn btn-sm " onclick="deletePost(${post.id})">Delete</button>
                </div>
            </div>
        </div>
    `;
        });

        renderPagination(totalPages);

    } catch (err) {
        console.error("Error loading posts:", err);
        postContainer.innerHTML = `<div class="text-center w-100 text-danger">Error fetching posts</div>`;
    }
}

// Render pagination buttons
function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = e => {
            e.preventDefault();
            loadPosts(i);
        };
        pagination.appendChild(li);
    }
}

async function deletePost(postId) {
    const token = getToken();
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
        const res = await fetch(`${postEndPoint}/delete/${postId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to delete post");
        loadPosts(); // reload posts
    } catch (err) {
        console.error(err);
        alert("Failed to delete post.");
    }
}
