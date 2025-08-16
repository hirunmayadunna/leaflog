// // 

// /* LeafLog — Add/List (in-memory) */
// (function () {
//     console.log("LeafLog booted ✅");

//     // ----- Data (in-memory for now) -----
//     const books = []; // {id, title, author, status, createdAt}

//     // ----- DOM Cache -----
//     const searchInput = document.getElementById("search");
//     const statusSelect = document.getElementById("statusFilter");
//     const addBtn = document.getElementById("addBookBtn");
//     const grid = document.getElementById("bookGrid");
//     const empty = document.getElementById("emptyState");

//     // Modal/form elements
//     const dialog = document.getElementById("addDialog");
//     const addForm = document.getElementById("addForm");
//     const titleInput = document.getElementById("titleInput");
//     const authorInput = document.getElementById("authorInput");
//     const statusInput = document.getElementById("statusInput");
//     const addError = document.getElementById("addError");

//     // ----- Utilities -----
//     const uid = () => "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);

//     function getFilters() {
//         return {
//             q: searchInput.value.trim().toLowerCase(),
//             status: statusSelect.value
//         };
//     }

//     // ----- Rendering -----
//     function render() {
//         const { q, status } = getFilters();

//         const filtered = books.filter(b => {
//             const textMatch =
//                 b.title.toLowerCase().includes(q) ||
//                 b.author.toLowerCase().includes(q);
//             const statusMatch = status === "all" ? true : b.status === status;
//             return textMatch && statusMatch;
//         });

//         grid.innerHTML = filtered.map(b => cardHTML(b)).join("");

//         // Empty state toggle
//         empty.hidden = filtered.length > 0;
//     }

//     function cardHTML(b) {
//         const chipClass =
//             b.status === "done" ? "chip chip--done"
//                 : b.status === "reading" ? "chip chip--reading"
//                     : "chip chip--to-read";

//         return `
//       <article class="card" data-id="${b.id}">
//         <h3 class="card__title">${escapeHTML(b.title)}</h3>
//         <p class="card__meta">by ${escapeHTML(b.author)}</p>
//         <span class="${chipClass}">${b.status}</span>
//       </article>
//     `;
//     }

//     function escapeHTML(str) {
//         return String(str)
//             .replace(/&/g, "&amp;")
//             .replace(/</g, "&lt;")
//             .replace(/>/g, "&gt;")
//             .replace(/"/g, "&quot;")
//             .replace(/'/g, "&#039;");
//     }

//     // ----- Modal open/close + focus -----
//     let lastFocused = null;

//     function openDialog() {
//         lastFocused = document.activeElement;
//         dialog.hidden = false;
//         titleInput.value = "";
//         authorInput.value = "";
//         statusInput.value = "to-read";
//         addError.hidden = true;
//         // Focus first field
//         setTimeout(() => titleInput.focus(), 0);
//         // trap basic: close on Esc
//         document.addEventListener("keydown", onEscClose);
//     }

//     function closeDialog() {
//         dialog.hidden = true;
//         document.removeEventListener("keydown", onEscClose);
//         if (lastFocused) lastFocused.focus();
//     }

//     function onEscClose(e) {
//         if (e.key === "Escape") closeDialog();
//     }

//     // Close when clicking backdrop or [data-close]
//     dialog.addEventListener("click", (e) => {
//         if (e.target.matches("[data-close]") || e.target.classList.contains("modal__backdrop")) {
//             closeDialog();
//         }
//     });

//     // ----- Handlers -----
//     addBtn.addEventListener("click", openDialog);

//     addForm.addEventListener("submit", (e) => {
//         e.preventDefault();
//         const title = titleInput.value.trim();
//         const author = authorInput.value.trim();
//         const status = statusInput.value;

//         if (!title || !author) {
//             addError.textContent = "Title and Author are required.";
//             addError.hidden = false;
//             return;
//         }

//         const book = {
//             id: uid(),
//             title,
//             author,
//             status,
//             createdAt: Date.now()
//         };
//         books.push(book);

//         // feedback (screen readers)
//         addError.textContent = "Book added.";
//         addError.hidden = false;
//         setTimeout(() => (addError.hidden = true), 1200);

//         closeDialog();
//         render();
//     });

//     searchInput.addEventListener("input", render);
//     statusSelect.addEventListener("change", render);

//     // ----- Initial render -----
//     render();
// })();




/* LeafLog — Add/List with LocalStorage (v1) */
// (function () {
//     console.log("LeafLog booted ✅");

//     // ----- Persistence -----
//     const STORAGE_KEY = "leaflog.books.v1";

//     function loadBooks() {
//         try {
//             const raw = localStorage.getItem(STORAGE_KEY);
//             if (!raw) return [];
//             const parsed = JSON.parse(raw);
//             if (!Array.isArray(parsed)) return [];
//             // basic shape guard
//             return parsed.filter(
//                 b => b && typeof b.id === "string" && typeof b.title === "string" && typeof b.author === "string"
//             );
//         } catch (e) {
//             console.warn("LeafLog: failed to parse local data; starting fresh.", e);
//             return [];
//         }
//     }

//     function saveBooks(arr) {
//         try {
//             localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
//         } catch (e) {
//             console.error("LeafLog: failed to save to localStorage.", e);
//         }
//     }

//     // ----- Data -----
//     const books = loadBooks(); // in-memory array synced to LS

//     // ----- DOM Cache -----
//     const searchInput = document.getElementById("search");
//     const statusSelect = document.getElementById("statusFilter");
//     const addBtn = document.getElementById("addBookBtn");
//     const grid = document.getElementById("bookGrid");
//     const empty = document.getElementById("emptyState");

//     // Modal/form elements
//     const dialog = document.getElementById("addDialog");
//     const addForm = document.getElementById("addForm");
//     const titleInput = document.getElementById("titleInput");
//     const authorInput = document.getElementById("authorInput");
//     const statusInput = document.getElementById("statusInput");
//     const addError = document.getElementById("addError");

//     // ----- Utilities -----
//     const uid = () => "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);

//     function getFilters() {
//         return {
//             q: searchInput.value.trim().toLowerCase(),
//             status: statusSelect.value
//         };
//     }

//     // ----- Rendering -----
//     function render() {
//         const { q, status } = getFilters();

//         const filtered = books.filter(b => {
//             const textMatch =
//                 b.title.toLowerCase().includes(q) ||
//                 b.author.toLowerCase().includes(q);
//             const statusMatch = status === "all" ? true : b.status === status;
//             return textMatch && statusMatch;
//         });

//         grid.innerHTML = filtered.map(b => cardHTML(b)).join("");

//         // Empty state toggle
//         empty.hidden = filtered.length > 0;
//     }

//     function cardHTML(b) {
//         const chipClass =
//             b.status === "done" ? "chip chip--done"
//                 : b.status === "reading" ? "chip chip--reading"
//                     : "chip chip--to-read";

//         return `
//       <article class="card" data-id="${b.id}">
//         <h3 class="card__title">${escapeHTML(b.title)}</h3>
//         <p class="card__meta">by ${escapeHTML(b.author)}</p>
//         <span class="${chipClass}">${b.status}</span>
//       </article>
//     `;
//     }

//     function escapeHTML(str) {
//         return String(str)
//             .replace(/&/g, "&amp;")
//             .replace(/</g, "&lt;")
//             .replace(/>/g, "&gt;")
//             .replace(/"/g, "&quot;")
//             .replace(/'/g, "&#039;");
//     }

//     // ----- Modal open/close + focus -----
//     let lastFocused = null;

//     function openDialog() {
//         lastFocused = document.activeElement;
//         dialog.hidden = false;
//         titleInput.value = "";
//         authorInput.value = "";
//         statusInput.value = "to-read";
//         addError.hidden = true;
//         setTimeout(() => titleInput.focus(), 0);
//         document.addEventListener("keydown", onEscClose);
//     }

//     function closeDialog() {
//         dialog.hidden = true;
//         document.removeEventListener("keydown", onEscClose);
//         if (lastFocused) lastFocused.focus();
//     }

//     function onEscClose(e) {
//         if (e.key === "Escape") closeDialog();
//     }

//     // Close when clicking backdrop or [data-close]
//     dialog.addEventListener("click", (e) => {
//         if (e.target.matches("[data-close]") || e.target.classList.contains("modal__backdrop")) {
//             closeDialog();
//         }
//     });

//     // ----- Handlers -----
//     addBtn.addEventListener("click", openDialog);

//     addForm.addEventListener("submit", (e) => {
//         e.preventDefault();
//         const title = titleInput.value.trim();
//         const author = authorInput.value.trim();
//         const status = statusInput.value;

//         if (!title || !author) {
//             addError.textContent = "Title and Author are required.";
//             addError.hidden = false;
//             return;
//         }

//         const book = {
//             id: uid(),
//             title,
//             author,
//             status,
//             createdAt: Date.now()
//         };
//         books.push(book);
//         saveBooks(books);   // ⬅️ persist

//         // feedback (screen readers)
//         addError.textContent = "Book added.";
//         addError.hidden = false;
//         setTimeout(() => (addError.hidden = true), 1200);

//         closeDialog();
//         render();
//     });

//     searchInput.addEventListener("input", render);
//     statusSelect.addEventListener("change", render);

//     // ----- Initial render -----
//     render();
// })();


/* LeafLog — Edit & Delete + LocalStorage (v1) */
(function () {
    console.log("LeafLog booted ✅");

    // ----- Persistence -----
    const STORAGE_KEY = "leaflog.books.v1";

    function loadBooks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(
                b => b && typeof b.id === "string" && typeof b.title === "string" && typeof b.author === "string"
            );
        } catch (e) {
            console.warn("LeafLog: failed to parse local data; starting fresh.", e);
            return [];
        }
    }
    function saveBooks(arr) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        } catch (e) {
            console.error("LeafLog: failed to save to localStorage.", e);
        }
    }

    // ----- Data -----
    const books = loadBooks(); // in-memory array synced to LS
    let editingId = null;      // null = add, string = edit existing

    // ----- DOM Cache -----
    const searchInput = document.getElementById("search");
    const statusSelect = document.getElementById("statusFilter");
    const addBtn = document.getElementById("addBookBtn");
    const grid = document.getElementById("bookGrid");
    const empty = document.getElementById("emptyState");
    const toast = document.getElementById("toast");

    // Modal/form elements
    const dialog = document.getElementById("addDialog");
    const addForm = document.getElementById("addForm");
    const titleInput = document.getElementById("titleInput");
    const authorInput = document.getElementById("authorInput");
    const statusInput = document.getElementById("statusInput");
    const addError = document.getElementById("addError");
    const dialogTitle = document.getElementById("addDialogTitle");

    // ----- Utilities -----
    const uid = () => "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const say = (msg) => { if (toast) { toast.textContent = msg; } };

    function getFilters() {
        return {
            q: searchInput.value.trim().toLowerCase(),
            status: statusSelect.value
        };
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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
        empty.hidden = filtered.length > 0;
    }

    function cardHTML(b) {
        const chipClass =
            b.status === "done" ? "chip chip--done"
                : b.status === "reading" ? "chip chip--reading"
                    : "chip chip--to-read";

        const safeTitle = escapeHTML(b.title);

        return `
      <article class="card" data-id="${b.id}">
        <h3 class="card__title">${safeTitle}</h3>
        <p class="card__meta">by ${escapeHTML(b.author)}</p>
        <span class="${chipClass}">${b.status}</span>

        <div class="card__actions">
          <button class="btn" type="button" data-action="edit" aria-label="Edit ${safeTitle}">Edit</button>
          <button class="btn" type="button" data-action="delete" aria-label="Delete ${safeTitle}">Delete</button>
        </div>
      </article>
    `;
    }

    // ----- Modal open/close + focus -----
    let lastFocused = null;

    function openAddDialog() {
        editingId = null;
        lastFocused = document.activeElement;
        dialog.hidden = false;
        dialogTitle.textContent = "Add a Book";
        titleInput.value = "";
        authorInput.value = "";
        statusInput.value = "to-read";
        addError.hidden = true;
        setTimeout(() => titleInput.focus(), 0);
        document.addEventListener("keydown", onEscClose);
    }

    function openEditDialog(id) {
        const b = books.find(x => x.id === id);
        if (!b) return;
        editingId = id;
        lastFocused = document.activeElement;
        dialog.hidden = false;
        dialogTitle.textContent = "Edit Book";
        titleInput.value = b.title;
        authorInput.value = b.author;
        statusInput.value = b.status;
        addError.hidden = true;
        setTimeout(() => titleInput.focus(), 0);
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
    addBtn.addEventListener("click", openAddDialog);

    // Submit (Add or Edit)
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

        if (editingId === null) {
            // ADD
            const book = {
                id: uid(),
                title,
                author,
                status,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            books.push(book);
            saveBooks(books);
            say("Book added.");
        } else {
            // EDIT
            const idx = books.findIndex(b => b.id === editingId);
            if (idx !== -1) {
                books[idx] = {
                    ...books[idx],
                    title,
                    author,
                    status,
                    updatedAt: Date.now()
                };
                saveBooks(books);
                say("Book updated.");
            }
            editingId = null;
        }

        closeDialog();
        render();
    });

    // Card actions (event delegation)
    grid.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("[data-action]");
        if (!actionBtn) return;

        const card = actionBtn.closest("[data-id]");
        if (!card) return;
        const id = card.getAttribute("data-id");
        const action = actionBtn.getAttribute("data-action");

        if (action === "edit") {
            openEditDialog(id);
            return;
        }

        if (action === "delete") {
            if (confirm("Delete this book?")) {
                const idx = books.findIndex(b => b.id === id);
                if (idx !== -1) {
                    books.splice(idx, 1);
                    saveBooks(books);
                    render();
                    say("Book deleted.");
                    // keep focus sensible
                    addBtn.focus();
                }
            }
            return;
        }
    });

    // Filters
    searchInput.addEventListener("input", render);
    statusSelect.addEventListener("change", render);

    // ----- Initial render -----
    render();
})();
