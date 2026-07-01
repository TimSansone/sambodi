const state = {
  selectedReference: "",
  selectedText: ""
};

const workSelect = document.querySelector("#workSelect");
const bookSelect = document.querySelector("#bookSelect");
const chapterSelect = document.querySelector("#chapterSelect");
const chapterLabel = document.querySelector("#chapterLabel");
const verseStart = document.querySelector("#verseStart");
const verseEnd = document.querySelector("#verseEnd");
const selectorForm = document.querySelector("#selectorForm");
const passageTitle = document.querySelector("#passageTitle");
const passageDisplay = document.querySelector("#passageDisplay");
const aiOutput = document.querySelector("#aiOutput");
const modeButtons = document.querySelectorAll("[data-mode]");
const connectionStatus = document.querySelector("#connectionStatus");

function option(value) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = value;
  return item;
}

function selectedWorkData() {
  return window.SCRIPTURE_DATA[workSelect.value] || {};
}

function selectedBookData() {
  return selectedWorkData()[bookSelect.value] || {};
}

function resetSelect(select, values) {
  select.innerHTML = "";
  values.forEach((value) => select.appendChild(option(value)));
}

function populateWorks() {
  resetSelect(workSelect, Object.keys(window.SCRIPTURE_DATA));
  populateBooks();
}

function populateBooks() {
  resetSelect(bookSelect, Object.keys(selectedWorkData()));
  populateChapters();
}

function populateChapters() {
  chapterLabel.textContent = workSelect.value === "Doctrine and Covenants" ? "Section" : "Chapter";
  resetSelect(chapterSelect, Object.keys(selectedBookData()));
}

function getSelectedVerses() {
  const verses = selectedBookData()[chapterSelect.value] || [];
  const start = Number(verseStart.value || 1);
  const end = Number(verseEnd.value || verses.length);
  const low = Math.max(1, Math.min(start, end));
  const high = Math.min(verses.length, Math.max(start, end));

  return verses
    .map((text, index) => ({ number: index + 1, text }))
    .filter((verse) => verse.number >= low && verse.number <= high);
}

function buildReference() {
  const verses = getSelectedVerses();
  const versePart = verses.length && verses.length !== (selectedBookData()[chapterSelect.value] || []).length
    ? `:${verses[0].number}${verses.length > 1 ? `-${verses[verses.length - 1].number}` : ""}`
    : "";
  return `${bookSelect.value} ${chapterSelect.value}${versePart}`;
}

function renderPassage(event) {
  if (event) event.preventDefault();
  const verses = getSelectedVerses();
  const reference = buildReference();

  state.selectedReference = reference;
  state.selectedText = verses.map((verse) => `${verse.number}. ${verse.text}`).join("\n");
  passageTitle.textContent = reference;

  passageDisplay.innerHTML = verses.map((verse) => `
    <p class="verse"><sup>${verse.number}</sup>${escapeHtml(verse.text)}</p>
  `).join("") || `<p class="muted">No verses found for this selection.</p>`;

  aiOutput.innerHTML = `<p class="muted">Choose a study mode on the right to analyze ${escapeHtml(reference)}.</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function localFallback(mode) {
  const text = state.selectedText || "";
  const lines = text.split("\n").filter(Boolean);
  const firstLine = lines[0] || state.selectedReference;
  const lastLine = lines[lines.length - 1] || state.selectedReference;

  return `
    <h3>ChatGPT is not connected</h3>
    <p>This is only a browser fallback, not the true AI deep dive. To get the kind of response you get when you ask ChatGPT directly, open the app through the Node/Express server with <code>OPENAI_API_KEY</code> set.</p>
    <ul>
      <li><strong>Reference:</strong> ${escapeHtml(state.selectedReference)}</li>
      <li><strong>Requested mode:</strong> ${escapeHtml(mode)}</li>
      <li><strong>Opening movement:</strong> ${escapeHtml(firstLine)}</li>
      <li><strong>Closing movement:</strong> ${escapeHtml(lastLine)}</li>
      <li><strong>Next step:</strong> Start the backend, then click the same study button again. The full passage text will be sent to ChatGPT securely from the server.</li>
    </ul>
  `;
}

async function checkConnection() {
  try {
    const response = await fetch("/api/status");
    if (!response.ok) throw new Error("Status endpoint unavailable");
    const status = await response.json();
    if (status.openaiConfigured) {
      connectionStatus.textContent = `ChatGPT deep dives are connected through the backend (${status.model}).`;
      connectionStatus.className = "connection-status is-ready";
    } else {
      connectionStatus.textContent = "Backend is running, but OPENAI_API_KEY is not set yet.";
      connectionStatus.className = "connection-status is-offline";
    }
  } catch {
    connectionStatus.textContent = "Browser-only mode: start the Node/Express server with OPENAI_API_KEY for true ChatGPT deep dives.";
    connectionStatus.className = "connection-status is-offline";
  }
}

async function runStudyMode(mode) {
  if (!state.selectedReference || !state.selectedText) renderPassage();

  aiOutput.innerHTML = `<p class="muted">Studying ${escapeHtml(state.selectedReference)}...</p>`;
  modeButtons.forEach((button) => button.disabled = true);

  try {
    const response = await fetch("/api/deep-dive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: state.selectedReference,
        scriptureText: state.selectedText,
        studyMode: mode
      })
    });

    if (!response.ok) throw new Error("OpenAI backend is not available.");
    const data = await response.json();
    aiOutput.innerHTML = data.html || localFallback(mode);
  } catch {
    aiOutput.innerHTML = localFallback(mode);
  } finally {
    modeButtons.forEach((button) => button.disabled = false);
  }
}

workSelect.addEventListener("change", () => {
  populateBooks();
  renderPassage();
});

bookSelect.addEventListener("change", () => {
  populateChapters();
  renderPassage();
});

chapterSelect.addEventListener("change", renderPassage);
selectorForm.addEventListener("submit", renderPassage);
modeButtons.forEach((button) => {
  button.addEventListener("click", () => runStudyMode(button.dataset.mode));
});

populateWorks();
renderPassage();
checkConnection();
