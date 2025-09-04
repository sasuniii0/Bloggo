    const followBtn = document.getElementById("followBtn");
    let isFollowing = false;

    followBtn.addEventListener("click", () => {
    isFollowing = !isFollowing;
    followBtn.innerHTML = isFollowing
    ? '<i class="fas fa-user-check me-1"></i> Following'
    : '<i class="fas fa-user-plus me-1"></i> Follow';

    followBtn.classList.toggle("btn-primary", !isFollowing);
    followBtn.classList.toggle("btn-outline-secondary", isFollowing);
});
