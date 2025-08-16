// 

/* LeafLog — Add/List (in-memory) */
(function () {
    console.log("LeafLog booted ✅");

    // ----- Data (in-memory for now) -----
    const books = []; // {id, title, author, status, createdAt}

    // ----- DOM Cache -----
    const searchInput = document.getElementById("search");
    const statusSelect = document.getElementById("statusFilter");
    const addBtn = document.getElementById("addBookBtn");
    const grid = document.getElementById("bookGrid");
    const empty = document.getElementById("emptyState");

    // Modal/form elements
    const dialog = document.getElementById("addDialog");
    const addForm = document.getElementById("addForm");
    const titleInput = document.getElementById("titleInput");
    const authorInput = document.getElementById("authorInput");
    const statusInput = document.getElementById("statusInput");
    const addError = document.getElementById("addError");

    // ----- Utilities -----
    const uid = () => "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);

    function getFilters() {
        return {
            q: searchInput.value.trim().toLowerCase(),
            status: statusSelect.value
        };
    }

    // ----- Rendering -----
    function render() {
        const { q, status } = getFilters();

        const filtered = books.filter(b => {
            const textMatch =
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q);
            const statusMatch = status === "all" ? true : b.status === status;
            return textMatch && statusMatch;
        });

        grid.innerHTML = filtered.map(b => cardHTML(b)).join("");

        // Empty state toggle
        empty.hidden = filtered.length > 0;
    }

    function cardHTML(b) {
        const chipClass =
            b.status === "done" ? "chip chip--done"
                : b.status === "reading" ? "chip chip--reading"
                    : "chip chip--to-read";

        return `
      <article class="card" data-id="${b.id}">
        <h3 class="card__title">${escapeHTML(b.title)}</h3>
        <p class="card__meta">by ${escapeHTML(b.author)}</p>
        <span class="${chipClass}">${b.status}</span>
      </article>
    `;
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ----- Modal open/close + focus -----
    let lastFocused = null;

    function openDialog() {
        lastFocused = document.activeElement;
        dialog.hidden = false;
        titleInput.value = "";
        authorInput.value = "";
        statusInput.value = "to-read";
        addError.hidden = true;
        // Focus first field
        setTimeout(() => titleInput.focus(), 0);
        // trap basic: close on Esc
        document.addEventListener("keydown", onEscClose);
    }

    function closeDialog() {
        dialog.hidden = true;
        document.removeEventListener("keydown", onEscClose);
        if (lastFocused) lastFocused.focus();
    }

    function onEscClose(e) {
        if (e.key === "Escape") closeDialog();
    }

    // Close when clicking backdrop or [data-close]
    dialog.addEventListener("click", (e) => {
        if (e.target.matches("[data-close]") || e.target.classList.contains("modal__backdrop")) {
            closeDialog();
        }
    });

    // ----- Handlers -----
    addBtn.addEventListener("click", openDialog);

    addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const status = statusInput.value;

        if (!title || !author) {
            addError.textContent = "Title and Author are required.";
            addError.hidden = false;
            return;
        }

        const book = {
            id: uid(),
            title,
            author,
            status,
            createdAt: Date.now()
        };
        books.push(book);

        // feedback (screen readers)
        addError.textContent = "Book added.";
        addError.hidden = false;
        setTimeout(() => (addError.hidden = true), 1200);

        closeDialog();
        render();
    });

    searchInput.addEventListener("input", render);
    statusSelect.addEventListener("change", render);

    // ----- Initial render -----
    render();
})();
