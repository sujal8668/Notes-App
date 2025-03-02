document.addEventListener("DOMContentLoaded", function () {
    const addNoteBtn = document.getElementById("addNoteBtn");
    const colorPicker = document.getElementById("colorPicker");
    const notesContainer = document.getElementById("notesContainer");
    const noteModal = document.getElementById("noteModal");
    const saveNoteBtn = document.getElementById("saveNote");
    const closeModalBtn = document.getElementById("closeModal");
    const searchBar = document.getElementById("searchBar");
    const themeToggle = document.getElementById("themeToggle");
    const modalContent = document.querySelector(".modal-content");
    let selectedColor = "";
    let editingNote = null;

    // Apply saved theme
    function applyTheme() {
        const savedTheme = localStorage.getItem("theme");
        document.body.classList.toggle("dark-mode", savedTheme === "dark");
    }
    applyTheme();

    // Toggle theme
    themeToggle.addEventListener("click", () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    });

    // Load saved notes
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.forEach(note => createNote(note.title, note.content, note.color, note.date, note.pinned, false));
    }
    loadNotes();

    addNoteBtn.addEventListener("click", () => {
        colorPicker.classList.toggle("hidden");
    });

    document.querySelectorAll(".color-option").forEach(colorOption => {
        colorOption.addEventListener("click", function () {
            selectedColor = this.getAttribute("data-color");
            colorPicker.classList.add("hidden");
            noteModal.classList.remove("hidden");
            modalContent.style.background = selectedColor;
        });
    });

    saveNoteBtn.addEventListener("click", () => {
        const title = document.getElementById("noteTitle").value.trim();
        const content = document.getElementById("noteContent").value.trim();
        const date = new Date().toLocaleDateString();

        if (title === "" || content === "") {
            alert("Title and Subheading cannot be empty!");
            return;
        }

        if (editingNote) {
            editingNote.querySelector("h3").innerText = title;
            editingNote.querySelector("p").innerText = truncateText(content, 4);
            updateNoteInStorage(editingNote.getAttribute("data-title"), editingNote.getAttribute("data-content"), title, content);
            editingNote = null;
        } else {
            createNote(title, content, selectedColor, date, false, true);
        }

        noteModal.classList.add("hidden");
        document.getElementById("noteTitle").value = "";
        document.getElementById("noteContent").value = "";
    });

    closeModalBtn.addEventListener("click", () => {
        noteModal.classList.add("hidden");
        editingNote = null;
    });

    function createNote(title, content, color, date, pinned = false, saveToLocalStorage = true) {
        const note = document.createElement("div");
        note.classList.add("note");
        if (pinned) note.classList.add("pinned");
        note.style.background = color;
        note.innerHTML = `
            <h3>${title}</h3>
            <br />
            <p>${truncateText(content, 4)}</p>
            <br/><br/>
            <div class="ss">
                <small>${date}</small>
                <button class="edit-note">✏️</button>
            </div>
            <div class="note-icons">
                <i class="ri-pushpin-fill pin-icon ${pinned ? 'active' : ''}"></i>
                <i class="ri-delete-bin-6-fill delete-icon"></i>
            </div>
        `;

        note.setAttribute("data-title", title.toLowerCase());
        note.setAttribute("data-content", content.toLowerCase());

        const pinIcon = note.querySelector(".pin-icon");
        pinIcon.addEventListener("click", function () {
            note.classList.toggle("pinned");
            pinIcon.classList.toggle("active");
            updateNotePinStatus(title, content, note.classList.contains("pinned"));
            updateNotesOrder();
        });

        note.querySelector(".delete-icon").addEventListener("click", function () {
            note.remove();
            deleteNoteFromStorage(title, content);
        });

        note.querySelector(".edit-note").addEventListener("click", function () {
            document.getElementById("noteTitle").value = title;
            document.getElementById("noteContent").value = content;
            selectedColor = color;
            modalContent.style.background = selectedColor;
            noteModal.classList.remove("hidden");
            editingNote = note;
        });

        notesContainer.appendChild(note);
        updateNotesOrder();

        if (saveToLocalStorage) {
            saveNoteToStorage(title, content, color, date, pinned);
        }
    }

    function truncateText(text, maxLines) {
        const lines = text.split("\n");
        return lines.length > maxLines ? lines.slice(0, maxLines).join("\n") + "..." : text;
    }

    function saveNoteToStorage(title, content, color, date, pinned) {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.push({ title, content, color, date, pinned });
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function updateNotePinStatus(title, content, isPinned) {
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes = notes.map(note => note.title === title && note.content === content ? { ...note, pinned: isPinned } : note);
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function updateNoteInStorage(oldTitle, oldContent, newTitle, newContent) {
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes = notes.map(note => note.title === oldTitle && note.content === oldContent ? { ...note, title: newTitle, content: newContent } : note);
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function deleteNoteFromStorage(title, content) {
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes = notes.filter(note => note.title !== title || note.content !== content);
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function updateNotesOrder() {
        const notes = Array.from(notesContainer.children);
        notes.sort((a, b) => (b.classList.contains("pinned") ? 1 : -1));
        notesContainer.innerHTML = "";
        notes.forEach(note => notesContainer.appendChild(note));
    }

    searchBar.addEventListener("input", function () {
        const searchText = searchBar.value.toLowerCase();
        document.querySelectorAll(".note").forEach(note => {
            note.style.display = note.getAttribute("data-title").includes(searchText) || note.getAttribute("data-content").includes(searchText) ? "block" : "none";
        });
    });
});
