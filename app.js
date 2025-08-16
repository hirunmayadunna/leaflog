/* LeafLog — starter wire-up */
(function () {
    console.log("LeafLog booted ✅");

    // Cache DOM
    const searchInput = document.getElementById("search");
    const statusSelect = document.getElementById("statusFilter");
    const addBtn = document.getElementById("addBookBtn");
    const grid = document.getElementById("bookGrid");
    const empty = document.getElementById("emptyState");

    // Initial UI state (no data yet)
    grid.innerHTML = "";
    empty.hidden = false;

    // No-op listeners (we'll implement in Phase 4)
    searchInput.addEventListener("input", () => {
        console.log("Search query:", searchInput.value.trim());
    });

    statusSelect.addEventListener("change", () => {
        console.log("Filter status:", statusSelect.value);
    });

    addBtn.addEventListener("click", () => {
        // In Phase 4 we’ll open a proper modal.
        alert("Add Book clicked (modal coming next)!");
    });
})();
