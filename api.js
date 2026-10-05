const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const submitButton = document.querySelector("#submit-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
let currentNotes = [];
let isRequestRunning = false;

async function request(path = "", options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`The server responded with status ${response.status}.`);
  }

  return response.json();
}

function showStatus(message, state = "") {
  statusMessage.textContent = message;
  statusMessage.className = state ? `status ${state}` : "status";
}

function setRequestBusy(isBusy) {
  isRequestRunning = isBusy;
  loadButton.disabled = isBusy;
  submitButton.disabled = isBusy;
  notesList.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
  });
}

function renderNotes(notes) {
  currentNotes = notes;
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes to show yet. Load notes or create one.";
    notesList.appendChild(emptyItem);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note-item";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    item.append(title, body);
    notesList.appendChild(item);
  });
}

async function loadNotes() {
  if (isRequestRunning) return;

  setRequestBusy(true);
  showStatus("Loading notes...", "loading");

  try {
    const notes = await request("?_limit=10");
    renderNotes(notes);
    showStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    showStatus("We couldn't load notes. Please try again.", "error");
    console.error(error);
  } finally {
    setRequestBusy(false);
  }
}

async function createNote(event) {
  event.preventDefault();
  if (isRequestRunning) return;

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title for your note.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("Titles must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  setRequestBusy(true);
  showStatus("Creating note...", "loading");

  try {
    const createdNote = await request("", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    renderNotes([createdNote, ...currentNotes]);
    showStatus(`Note created (status 201, id ${createdNote.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    showStatus("We couldn't create your note. Please try again.", "error");
    console.error(error);
  } finally {
    setRequestBusy(false);
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);