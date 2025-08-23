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
                    <a href="blog-details.html?id=${post.id}" 
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

    // 🔎 Live search as user types
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
