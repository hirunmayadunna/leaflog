/* LeafLog — Validation & UX polish (v1) */
(function () {
    console.log("LeafLog booted ✅");

    // ----- Persistence -----
    const STORAGE_KEY = "leaflog.books.v1";
    const MAX_LEN = 120;

    function loadBooks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(
                b => b && typeof b.id === "string" && typeof b.title === "string" && typeof b.author === "string"
            );
        } catch { return []; }
    }
    function saveBooks(arr) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch { }
    }

    // ----- Data -----
    const books = loadBooks();
    let editingId = null;

    // ----- DOM -----
    const searchInput = document.getElementById("search");
    const statusSelect = document.getElementById("statusFilter");
    const addBtn = document.getElementById("addBookBtn");
    const grid = document.getElementById("bookGrid");
    const empty = document.getElementById("emptyState");
    const toast = document.getElementById("toast");

    const dialog = document.getElementById("addDialog");
    const addForm = document.getElementById("addForm");
    const titleField = document.getElementById("titleField");
    const authorField = document.getElementById("authorField");
    const titleInput = document.getElementById("titleInput");
    const authorInput = document.getElementById("authorInput");
    const statusInput = document.getElementById("statusInput");
    const titleError = document.getElementById("titleError");
    const authorError = document.getElementById("authorError");
    const addError = document.getElementById("addError");
    const dialogTitle = document.getElementById("addDialogTitle");

    // ----- Utils -----
    const uid = () => "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const say = (msg) => { if (toast) toast.textContent = msg; };
    const norm = (s) => s.trim().replace(/\s+/g, " ");
    const keyFor = (t, a) => (t + "—" + a).toLowerCase();

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
        const q = searchInput.value.trim().toLowerCase();
        const status = statusSelect.value;

        const filtered = books.filter(b => {
            const textMatch = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
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

    // ----- Modal control -----
    let lastFocused = null;

    function clearErrors() {
        for (const [field, input, slot] of [
            [titleField, titleInput, titleError],
            [authorField, authorInput, authorError],
        ]) {
            field.classList.remove("field--error");
            input.classList.remove("input--error");
            input.removeAttribute("aria-invalid");
            slot.hidden = true;
            slot.textContent = "";
        }
        addError.hidden = true;
        addError.textContent = "";
    }

    function setFieldError(fieldEl, inputEl, slotEl, msg) {
        fieldEl.classList.add("field--error");
        inputEl.classList.add("input--error");
        inputEl.setAttribute("aria-invalid", "true");
        slotEl.hidden = false;
        slotEl.textContent = msg;
    }

    function openAddDialog() {
        editingId = null;
        lastFocused = document.activeElement;
        dialog.hidden = false;
        dialogTitle.textContent = "Add a Book";
        titleInput.value = "";
        authorInput.value = "";
        statusInput.value = "to-read";
        clearErrors();
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
        clearErrors();
        setTimeout(() => titleInput.focus(), 0);
        document.addEventListener("keydown", onEscClose);
    }

    function closeDialog() {
        dialog.hidden = true;
        document.removeEventListener("keydown", onEscClose);
        if (lastFocused) lastFocused.focus();
    }
    function onEscClose(e) { if (e.key === "Escape") closeDialog(); }

    dialog.addEventListener("click", (e) => {
        if (e.target.matches("[data-close]") || e.target.classList.contains("modal__backdrop")) {
            closeDialog();
        }
    });

    // ----- Validation -----
    function validateInputs(asEdit) {
        clearErrors();
        let valid = true;

        const t = norm(titleInput.value);
        const a = norm(authorInput.value);

        if (!t) { setFieldError(titleField, titleInput, titleError, "Title is required."); valid = false; }
        else if (t.length > MAX_LEN) { setFieldError(titleField, titleInput, titleError, `Title is too long (max ${MAX_LEN}).`); valid = false; }

        if (!a) { setFieldError(authorField, authorInput, authorError, "Author is required."); valid = false; }
        else if (a.length > MAX_LEN) { setFieldError(authorField, authorInput, authorError, `Author is too long (max ${MAX_LEN}).`); valid = false; }

        if (valid) {
            const targetKey = keyFor(t, a);
            const clash = books.find(b => keyFor(b.title, b.author) === targetKey && (!asEdit || b.id !== editingId));
            if (clash) { setFieldError(titleField, titleInput, titleError, "This book already exists."); valid = false; }
        }

        if (!valid) {
            const firstErr = document.querySelector(".input--error");
            if (firstErr) firstErr.focus();
        }

        return { valid, t, a };
    }

    // ----- Handlers -----
    addBtn.addEventListener("click", openAddDialog);

    addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const asEdit = editingId !== null;
        const { valid, t, a } = validateInputs(asEdit);
        if (!valid) return;

        const status = statusInput.value;

        if (!asEdit) {
            const book = { id: uid(), title: t, author: a, status, createdAt: Date.now(), updatedAt: Date.now() };
            books.push(book);
            saveBooks(books);
            say("Book added.");
        } else {
            const idx = books.findIndex(b => b.id === editingId);
            if (idx !== -1) {
                books[idx] = { ...books[idx], title: t, author: a, status, updatedAt: Date.now() };
                saveBooks(books);
                say("Book updated.");
            }
            editingId = null;
        }

        closeDialog();
        render();
    });

    grid.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("[data-action]");
        if (!actionBtn) return;
        const card = actionBtn.closest("[data-id]");
        if (!card) return;
        const id = card.getAttribute("data-id");
        const action = actionBtn.getAttribute("data-action");

        if (action === "edit") { openEditDialog(id); return; }

        if (action === "delete") {
            if (confirm("Delete this book?")) {
                const idx = books.findIndex(b => b.id === id);
                if (idx !== -1) {
                    books.splice(idx, 1);
                    saveBooks(books);
                    render();
                    say("Book deleted.");
                    addBtn.focus();
                }
            }
        }
    });

    searchInput.addEventListener("input", render);
    statusSelect.addEventListener("change", render);

    // ----- Initial render -----
    render();
})();
