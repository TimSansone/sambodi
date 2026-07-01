const state = {
  source: "Bible",
  selectedBook: "Genesis",
  selectedIds: new Set(),
  customPassages: [],
  chapterPassages: [],
  importedLibrary: new Map()
};

const listEl = document.querySelector("#scriptureList");
const selectedEl = document.querySelector("#selectedList");
const countEl = document.querySelector("#selectionCount");
const outputEl = document.querySelector("#deepDiveOutput");
const searchInput = document.querySelector("#searchInput");
const deepDiveButton = document.querySelector("#deepDiveButton");
const bookSelect = document.querySelector("#bookSelect");
const chapterGrid = document.querySelector("#chapterGrid");
const chapterHint = document.querySelector("#chapterHint");
const libraryImport = document.querySelector("#libraryImport");
const importStatus = document.querySelector("#importStatus");

function allPassages() {
  return [...window.SCRIPTURE_LIBRARY, ...state.chapterPassages, ...state.customPassages];
}

function chipClass(source) {
  return source.toLowerCase().replaceAll(" ", "-");
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

function booksForSource(source = state.source) {
  return window.SCRIPTURE_STRUCTURE[source] || [];
}

function currentBook() {
  return booksForSource().find(([book]) => book === state.selectedBook) || booksForSource()[0];
}

function referenceForChapter(source, book, chapter) {
  if (source === "Doctrine and Covenants" && book === "Doctrine and Covenants") {
    return `Doctrine and Covenants ${chapter}`;
  }
  if (source === "Doctrine and Covenants" && book === "Official Declaration") {
    return `Official Declaration ${chapter}`;
  }
  return `${book} ${chapter}`;
}

function chapterId(source, book, chapter) {
  return `chapter-${source}-${book}-${chapter}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function libraryKey(source, book, chapter) {
  return `${source}|${book}|${chapter}`.toLowerCase();
}

function referenceKey(reference) {
  return reference.toLowerCase().replace(/\s+/g, " ").trim();
}

function textFromImportedLibrary(source, book, chapter, reference) {
  return state.importedLibrary.get(libraryKey(source, book, chapter)) || state.importedLibrary.get(referenceKey(reference));
}

function chapterText(reference, source, book, chapter) {
  const importedText = textFromImportedLibrary(source, book, chapter, reference);
  if (importedText) return importedText;
  return `Entire chapter selected: ${reference}. ChatGPT can deep dive into this chapter by reference when the local server is running with an OpenAI API key. Import full text for exact wording in the left panel.`;
}

function ensureChapterPassage(source, book, chapter) {
  const id = chapterId(source, book, chapter);
  const existing = allPassages().find((item) => item.id === id);
  if (existing) return existing;

  const reference = referenceForChapter(source, book, chapter);
  const passage = {
    id,
    source,
    reference,
    book,
    chapter,
    isChapterSelection: true,
    text: chapterText(reference, source, book, chapter)
  };
  state.chapterPassages.push(passage);
  return passage;
}

function refreshChapterPassagesFromImport() {
  state.chapterPassages = state.chapterPassages.map((passage) => {
    if (!passage.isChapterSelection) return passage;
    return {
      ...passage,
      text: chapterText(passage.reference, passage.source, passage.book, passage.chapter)
    };
  });
}

function renderBookPicker() {
  const books = booksForSource();
  if (!books.length) return;
  if (!books.some(([book]) => book === state.selectedBook)) {
    state.selectedBook = books[0][0];
  }

  bookSelect.innerHTML = books.map(([book]) => `
    <option value="${escapeHtml(book)}" ${book === state.selectedBook ? "selected" : ""}>${escapeHtml(book)}</option>
  `).join("");
  renderChapterGrid();
}

function renderChapterGrid() {
  const book = currentBook();
  if (!book) return;
  const [bookName, chapterCount] = book;
  chapterHint.textContent = `${chapterCount} ${chapterCount === 1 ? "chapter" : "chapters"}`;

  chapterGrid.innerHTML = Array.from({ length: chapterCount }, (_, index) => {
    const chapter = index + 1;
    const id = chapterId(state.source, bookName, chapter);
    const selected = state.selectedIds.has(id);
    return `<button class="chapter-button ${selected ? "is-selected" : ""}" type="button" data-chapter="${chapter}">${chapter}</button>`;
  }).join("");
}

function renderLibrary() {
  const query = searchInput.value.trim().toLowerCase();
  const passages = allPassages().filter((item) => {
    const matchesSource = item.source === state.source || item.source === "Custom";
    const haystack = `${item.reference} ${item.book} ${item.text}`.toLowerCase();
    return matchesSource && (!query || haystack.includes(query));
  });

  listEl.innerHTML = passages.map((item) => {
    const selected = state.selectedIds.has(item.id);
    return `
      <button class="scripture-card ${selected ? "is-selected" : ""}" type="button" data-id="${item.id}">
        <span class="reference-row">
          <span class="reference">${escapeHtml(item.reference)}</span>
          <span class="source-chip ${chipClass(item.source)}">${escapeHtml(item.source)}</span>
        </span>
        <span class="scripture-text">${escapeHtml(item.text)}</span>
      </button>
    `;
  }).join("") || `<p class="empty-state">No passages match this search.</p>`;
}

function renderSelected() {
  const selected = allPassages().filter((item) => state.selectedIds.has(item.id));
  countEl.textContent = `${selected.length} selected`;
  selectedEl.innerHTML = selected.map((item) => `
    <article class="selected-card">
      <button class="remove-button" type="button" data-remove="${item.id}" title="Remove ${escapeHtml(item.reference)}" aria-label="Remove ${escapeHtml(item.reference)}">x</button>
      <div class="reference-row">
        <strong class="reference">${escapeHtml(item.reference)}</strong>
        <span class="source-chip ${chipClass(item.source)}">${escapeHtml(item.source)}</span>
      </div>
      <p class="scripture-text">${escapeHtml(item.text)}</p>
    </article>
  `).join("") || `<p class="empty-state">Choose passages from the library. Multiple selections will be held here together.</p>`;
}

function selectedPassages() {
  return allPassages().filter((item) => state.selectedIds.has(item.id));
}

function selectedModes() {
  return [
    ["Themes", document.querySelector("#themeMode").checked],
    ["Context", document.querySelector("#contextMode").checked],
    ["Application", document.querySelector("#applicationMode").checked],
    ["Questions", document.querySelector("#questionsMode").checked]
  ].filter(([, enabled]) => enabled).map(([label]) => label);
}

function normalizeImportedLibrary(data) {
  const map = new Map();
  const entries = Array.isArray(data) ? data : data.passages || data.scriptures || [];

  entries.forEach((entry) => {
    if (!entry || !entry.text) return;
    const source = entry.source || entry.volume || entry.standardWork;
    const book = entry.book;
    const chapter = entry.chapter;
    const reference = entry.reference;

    if (source && book && chapter && !entry.verse) {
      map.set(libraryKey(source, book, chapter), String(entry.text));
    }

    if (reference) {
      map.set(referenceKey(reference), String(entry.text));
    }
  });

  const verseGroups = new Map();
  entries.forEach((entry) => {
    if (!entry || !entry.text || !entry.verse) return;
    const source = entry.source || entry.volume || entry.standardWork;
    if (!source || !entry.book || !entry.chapter) return;
    const key = libraryKey(source, entry.book, entry.chapter);
    if (!verseGroups.has(key)) verseGroups.set(key, []);
    verseGroups.get(key).push(entry);
  });

  verseGroups.forEach((verses, key) => {
    verses.sort((a, b) => Number(a.verse) - Number(b.verse));
    map.set(key, verses.map((verse) => `${verse.verse}. ${verse.text}`).join(" "));
  });

  return map;
}

function handleLibraryImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const imported = normalizeImportedLibrary(data);
      if (!imported.size) throw new Error("No usable scripture entries found.");

      state.importedLibrary = imported;
      refreshChapterPassagesFromImport();
      renderLibrary();
      renderSelected();
      importStatus.textContent = `Imported ${imported.size} chapter/reference entries.`;
    } catch (error) {
      importStatus.textContent = `Import failed: ${error.message}`;
    }
  };
  reader.readAsText(file);
}

const STUDY_NOTES = {
  "john-3-16-17": {
    focus: "God's love is shown as an action, not a sentiment: He gives the Son so the world can be saved rather than condemned.",
    phrases: ["God so loved the world", "he gave", "not ... to condemn", "might be saved"],
    context: "John places salvation in the language of divine initiative. The passage moves from God's love, to God's gift, to the purpose of Christ's mission.",
    application: "Ask what it would mean to treat God's love as something already extended toward the world, including people you find difficult to love."
  },
  "matthew-5-14-16": {
    focus: "Discipleship is public without being self-centered: good works are meant to reveal the Father, not advertise the disciple.",
    phrases: ["light of the world", "cannot be hid", "let your light so shine", "glorify your Father"],
    context: "This comes from the Sermon on the Mount, where Jesus describes the visible character of covenant living.",
    application: "Look for one place where quiet goodness could make God's character easier for someone else to see."
  },
  "james-1-5": {
    focus: "The verse treats lack of wisdom as an invitation to ask God, not as a reason for shame.",
    phrases: ["lack wisdom", "let him ask of God", "giveth ... liberally", "it shall be given him"],
    context: "James opens with trials, patience, and spiritual maturity. Wisdom is presented as a gift for people trying to endure faithfully.",
    application: "Turn uncertainty into a direct prayer instead of only more private worrying or analysis."
  },
  "isaiah-53-3-5": {
    focus: "The servant enters sorrow, rejection, and woundedness, and the healing comes through suffering borne on behalf of others.",
    phrases: ["despised and rejected", "man of sorrows", "with his stripes", "we are healed"],
    context: "This servant song uses grief and substitutionary language to describe redemption through suffering.",
    application: "Consider where Christ's healing reaches not only guilt, but grief, rejection, and hidden wounds."
  },
  "alma-32-21": {
    focus: "Faith is framed as hopeful trust in true things that are not yet fully seen or perfectly known.",
    phrases: ["not ... perfect knowledge", "hope for things", "not seen", "which are true"],
    context: "Alma is teaching humble hearers how belief can begin and grow before certainty is complete.",
    application: "Name one true thing you can act on before you feel complete certainty."
  },
  "mosiah-2-17": {
    focus: "Service to other people is treated as direct service to God, collapsing the distance between worship and daily relationships.",
    phrases: ["service of your fellow beings", "service of your God"],
    context: "King Benjamin's address links covenant devotion with humility, gratitude, and concrete care for others.",
    application: "Choose one ordinary act of service and treat it as worship rather than as an interruption."
  },
  "ether-12-27": {
    focus: "Weakness is not merely exposed; it becomes the place where humility and grace can create strength.",
    phrases: ["show unto them their weakness", "my grace is sufficient", "humble themselves", "weak things become strong"],
    context: "Moroni reflects on inadequacy and divine grace while preserving sacred records for future readers.",
    application: "Instead of hiding one weakness, bring it honestly to God and ask what humility would look like there."
  },
  "moroni-10-4-5": {
    focus: "Spiritual knowledge is connected to remembering mercy, sincere asking, faith in Christ, and the Holy Ghost.",
    phrases: ["ask God", "in the name of Christ", "sincere heart", "power of the Holy Ghost"],
    context: "Moroni closes the record with an invitation to seek divine confirmation, not merely intellectual agreement.",
    application: "Pair study with a specific prayer that asks what God wants you to know or do next."
  },
  "dc-6-36": {
    focus: "The command is intensely inward: every thought can be reoriented toward Christ, which pushes back against doubt and fear.",
    phrases: ["Look unto me", "every thought", "doubt not", "fear not"],
    context: "Early revelations often speak to uncertainty, calling disciples to trust Christ while decisions are still unfolding.",
    application: "When a fear repeats, answer it with a deliberate turn of attention toward Christ."
  },
  "dc-8-2-3": {
    focus: "Revelation is described as both mental and spiritual: God can speak in the mind and in the heart.",
    phrases: ["in your mind", "in your heart", "Holy Ghost", "spirit of revelation"],
    context: "This revelation teaches how divine communication may be recognized, joining thought, feeling, and the Holy Ghost.",
    application: "When seeking guidance, write down both clear thoughts and settled spiritual impressions."
  },
  "dc-18-10-11": {
    focus: "The worth of souls is grounded in the Redeemer's suffering, not in status, usefulness, or visible righteousness.",
    phrases: ["worth of souls is great", "Redeemer suffered death", "all men might repent"],
    context: "The section connects missionary labor and repentance with the immeasurable value of each soul.",
    application: "Let this passage reshape how you see one person whose worth you have been tempted to measure too narrowly."
  },
  "dc-121-41-42": {
    focus: "Righteous influence depends on persuasion, patience, gentleness, meekness, and sincere love rather than control.",
    phrases: ["no power or influence", "persuasion", "long-suffering", "gentleness and meekness", "love unfeigned"],
    context: "This counsel reframes authority as moral influence governed by Christlike character.",
    application: "In one relationship, replace pressure with persuasion and love that does not need to perform."
  }
};

const TOPIC_WORDS = [
  "faith", "hope", "wisdom", "light", "love", "service", "truth", "heart", "mind", "grace",
  "weakness", "strong", "fear", "doubt", "holy", "ghost", "christ", "god", "redeemer", "souls",
  "repent", "saved", "healed", "revelation", "ask", "give", "world", "father"
];

function sentenceParts(text) {
  return text
    .split(/[.;:!?]+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 8);
}

function keyPhrasesFor(passage) {
  if (STUDY_NOTES[passage.id]) return STUDY_NOTES[passage.id].phrases;
  return sentenceParts(passage.text)
    .sort((a, b) => b.length - a.length)
    .slice(0, 3)
    .map((part) => part.length > 92 ? `${part.slice(0, 89)}...` : part);
}

function repeatedTerms(passages) {
  const counts = new Map();
  passages.forEach((passage) => {
    const words = new Set((passage.text.toLowerCase().match(/[a-z]+/g) || []));
    TOPIC_WORDS.forEach((word) => {
      if (words.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([word, count]) => `${word} (${count})`);
}

function passageObservation(passage) {
  if (passage.isChapterSelection) {
    return {
      focus: `${passage.reference} is selected as a whole chapter. For a real chapter deep dive, launch the server with your OpenAI API key so ChatGPT can analyze the chapter by reference.`,
      context: "The browser-only fallback cannot reliably know the full chapter. The ChatGPT server route can receive the reference and ask for storyline, people, choices, consequences, themes, and study questions.",
      application: "Use ChatGPT mode for chapter-level study, or import/paste the chapter text for exact phrase-level analysis."
    };
  }

  if (STUDY_NOTES[passage.id]) return STUDY_NOTES[passage.id];

  const phrases = keyPhrasesFor(passage);
  const actionWords = ["ask", "look", "come", "serve", "remember", "let", "give", "hope", "fear", "doubt"]
    .filter((word) => passage.text.toLowerCase().includes(word));
  return {
    focus: `This passage turns on the movement from "${phrases[0] || passage.reference}" toward a response of ${actionWords[0] || "faith"}.`,
    phrases,
    context: "The strongest clues are the repeated words, commands, promises, and contrast words inside the selected text.",
    application: `Study the phrase "${phrases[0] || passage.reference}" and ask what it invites you to believe, stop doing, or begin practicing.`
  };
}

function localDeepDive(passages) {
  const references = passages.map((item) => item.reference).join(", ");
  const sourceMix = [...new Set(passages.map((item) => item.source))].join(", ");
  const sharedTerms = repeatedTerms(passages);
  const observations = passages.map((passage) => ({ passage, note: passageObservation(passage) }));
  const hasChapterOnly = passages.some((passage) => passage.isChapterSelection);

  return `
    <h3>Overview</h3>
    <ul>
      <li><strong>Selections:</strong> ${escapeHtml(references)}</li>
      <li><strong>Source mix:</strong> ${escapeHtml(sourceMix)}</li>
      <li><strong>Repeated study words:</strong> ${escapeHtml(sharedTerms.join(", ") || "No repeated words yet; add more text for stronger comparison.")}</li>
      ${hasChapterOnly ? "<li><strong>Note:</strong> One or more selections are chapter references without full text. Paste the chapter text for exact phrase-level analysis.</li>" : ""}
    </ul>

    <h3>Passage-by-Passage</h3>
    <ul>
      ${observations.map(({ passage, note }) => `
        <li><strong>${escapeHtml(passage.reference)}:</strong> ${escapeHtml(note.focus)}</li>
      `).join("")}
    </ul>

    <h3>Key Phrases</h3>
    <ul>
      ${observations.map(({ passage, note }) => {
        const phrases = note.phrases || keyPhrasesFor(passage);
        return `<li><strong>${escapeHtml(passage.reference)}:</strong> ${phrases.map((phrase) => `"${escapeHtml(phrase)}"`).join(", ") || "Full text needed for phrase extraction."}</li>`;
      }).join("")}
    </ul>

    <h3>Context</h3>
    <ul>
      ${observations.map(({ passage, note }) => `
        <li><strong>${escapeHtml(passage.reference)}:</strong> ${escapeHtml(note.context)}</li>
      `).join("")}
    </ul>

    <h3>Connections</h3>
    <ul>
      <li>${escapeHtml(passages.length > 1 ? `Read ${references} side by side by asking what each passage says about God's action and what each asks the disciple to do in response.` : `This single selection can be studied by moving from wording, to context, to invitation.`)}</li>
      <li>${escapeHtml(sharedTerms.length ? `The repeated terms suggest a study path around ${sharedTerms.map((term) => term.split(" ")[0]).join(", ")}.` : "The next layer of depth will come from adding more exact verse text or selecting additional passages.")}</li>
      <li>Look for contrasts: fear versus trust, weakness versus grace, private belief versus visible discipleship, or asking versus assuming.</li>
    </ul>

    <h3>Application</h3>
    <ul>
      ${observations.map(({ passage, note }) => `
        <li><strong>${escapeHtml(passage.reference)}:</strong> ${escapeHtml(note.application)}</li>
      `).join("")}
    </ul>

    <h3>Study Questions</h3>
    <ul>
      <li>Which exact phrase in each selected scripture carries the most weight?</li>
      <li>What does each passage reveal about God before it asks something of me?</li>
      <li>What command, promise, warning, or comfort is actually present in the wording?</li>
      <li>Where do these passages agree, and where does each one add a distinct emphasis?</li>
    </ul>
  `;
}

async function runDeepDive() {
  const passages = selectedPassages();
  if (!passages.length) {
    outputEl.innerHTML = `<p class="empty-state">Select at least one scripture first.</p>`;
    return;
  }

  deepDiveButton.disabled = true;
  deepDiveButton.textContent = "Studying...";
  outputEl.innerHTML = `<p class="empty-state">Preparing the deep dive...</p>`;

  try {
    const response = await fetch("/api/deep-dive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passages, modes: selectedModes() })
    });

    if (!response.ok) throw new Error("Local AI server not available");
    const data = await response.json();
    outputEl.innerHTML = data.html || localDeepDive(passages);
  } catch {
    outputEl.innerHTML = localDeepDive(passages);
  } finally {
    deepDiveButton.disabled = false;
    deepDiveButton.textContent = "Deep Dive";
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    state.source = tab.dataset.source;
    state.selectedBook = booksForSource()[0][0];
    renderBookPicker();
    renderLibrary();
  });
});

bookSelect.addEventListener("change", () => {
  state.selectedBook = bookSelect.value;
  renderChapterGrid();
});

chapterGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chapter]");
  if (!button) return;

  const [bookName] = currentBook();
  const chapter = Number(button.dataset.chapter);
  const passage = ensureChapterPassage(state.source, bookName, chapter);

  if (state.selectedIds.has(passage.id)) state.selectedIds.delete(passage.id);
  else state.selectedIds.add(passage.id);

  renderChapterGrid();
  renderLibrary();
  renderSelected();
});

listEl.addEventListener("click", (event) => {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  const id = card.dataset.id;
  if (state.selectedIds.has(id)) state.selectedIds.delete(id);
  else state.selectedIds.add(id);
  renderChapterGrid();
  renderLibrary();
  renderSelected();
});

selectedEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  state.selectedIds.delete(button.dataset.remove);
  renderChapterGrid();
  renderLibrary();
  renderSelected();
});

document.querySelector("#clearSelection").addEventListener("click", () => {
  state.selectedIds.clear();
  renderChapterGrid();
  renderLibrary();
  renderSelected();
});

document.querySelector("#customForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const reference = document.querySelector("#customReference").value.trim();
  const text = document.querySelector("#customText").value.trim();
  if (!reference || !text) return;
  const passage = {
    id: `custom-${Date.now()}`,
    source: "Custom",
    reference,
    book: "Custom",
    text
  };
  state.customPassages.push(passage);
  state.selectedIds.add(passage.id);
  event.target.reset();
  renderLibrary();
  renderSelected();
});

searchInput.addEventListener("input", renderLibrary);
deepDiveButton.addEventListener("click", runDeepDive);
libraryImport.addEventListener("change", handleLibraryImport);

renderBookPicker();
renderLibrary();
renderSelected();
