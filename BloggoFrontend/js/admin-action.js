// Example: confirm before banning a user
document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', function () {
        if (!confirm("Are you sure you want to ban this user?")) {
            event.preventDefault();
        }
    });
});