document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    const feedContainer = document.querySelector(".feed");
    const peopleContainer = document.querySelector(".rightbar .card ul.list-unstyled"); // People to Follow list

    if (!token) {
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Please log in to view the dashboard.</p>`;
        return;
    }

    try {
        const postsRes = await fetch("http://localhost:8080/api/v1/dashboard/all-posts", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!postsRes.ok) throw new Error("Failed to fetch posts");
        const postsData = await postsRes.json();
        const posts = Array.isArray(postsData.data) ? postsData.data : [];
        console.log("Posts:", posts);

        feedContainer.innerHTML = posts.length
            ? posts.map(post => `
        <article class="blog-card mb-3 p-3 shadow-sm rounded">
            <h3>${post.title || "Untitled"}</h3>
            <p>${post.content ? post.content.substring(0, 200) : ""}...</p>
            <div class="blog-meta d-flex justify-content-between">
                <span>by ${post.username || "Unknown"}</span>
                <span>🚀 ${post.boostCount || 0} · 💬 ${post.commentsCount || 0}</span>
            </div>
            <a href="story-detail.html?id=${post.id}" class="btn btn-sm btn-outline-primary mt-2">Read More</a>
          
        </article>
    `).join("")
            : `<p class="text-muted">No posts available.</p>`;


        /*const usersRes = await fetch("http://localhost:8080/api/v1/dashboard/all-users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const usersData = await usersRes.json();
        const users = Array.isArray(usersData.data) ? usersData.data : [];
        console.log("Users:", users);

        peopleContainer.innerHTML = users.length
            ? users.map(user => `
                <li>
                    <a href="profile.html?id=${user.id}" class="follow-link">
                        ${user.username}
                    </a>
                </li>
            `).join("")
            : `<li class="text-muted">No users found.</li>`;*/

    } catch (err) {
        console.error("Dashboard error:", err);
        feedContainer.innerHTML = `<p class="text-danger">⚠️ Error loading dashboard.</p>`;
    }
});


// 🔎 Search Functionality
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

async function searchBlogs() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
        searchResults.style.display = "none";
        searchResults.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/v1/dashboard/search/${keyword}`);
        const result = await response.json();

        if (result.data && result.data.length > 0) {
            searchResults.style.display = "block";
            searchResults.innerHTML = result.data.map(post => `
                <a href="story-detail.html?id=${post.id}" 
                   class="list-group-item list-group-item-action">
                    <strong>${post.title}</strong><br>
                    <small>by ${post.user?.username || "Unknown"} | 
                    ${post.tags?.map(t => "#" + t.name).join(", ") || ""}</small>
                </a>
            `).join("");
        } else {
            searchResults.style.display = "block";
            searchResults.innerHTML = `<div class="list-group-item text-muted">No results found</div>`;
        }
    } catch (err) {
        console.error("Search failed", err);
        searchResults.style.display = "block";
        searchResults.innerHTML = `<div class="list-group-item text-danger">⚠️ Failed to fetch results</div>`;
    }
}

// Live search as user types
searchInput.addEventListener("keyup", () => {
    if (searchInput.value.length >= 2) {
        searchBlogs();
    } else {
        searchResults.style.display = "none";
        searchResults.innerHTML = "";
    }
});

// Hide dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.style.display = "none";
    }
});

// 🌐 Toggle Tags
let expanded = false;
function toggleTags() {
    const extraTags = document.querySelectorAll(".extra-tag");
    const link = document.querySelector("#tagList + .browse-link");

    extraTags.forEach(tag => tag.classList.toggle("d-none"));

    expanded = !expanded;
    link.textContent = expanded ? "Show less..." : "Load more...";
}
