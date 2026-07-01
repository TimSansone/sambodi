# Deeper Scripture Study

A simple single-page scripture study app built with HTML, CSS, JavaScript, and a Node/Express backend.

## Run

Install dependencies:

```powershell
npm install
```

Start the server:

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
npm start
```

Then open:

```text
http://localhost:4173
```

Important: opening `public/index.html` directly runs the browser-only fallback. For true ChatGPT deep dives, use `http://localhost:4173` after starting the server with `OPENAI_API_KEY`.

If `node` and `npm` are not on your PATH inside Codex, use the bundled Node runtime or install Node.js on Windows.

## Scripture Data

The app now loads full local scripture data from:

```text
public/scripture-data-full.js
```

That file was generated from the provided local JSON files:

- `kjv-scriptures-json.txt` for the Bible
- `lds-scriptures-json.txt` for the Book of Mormon and Doctrine and Covenants

## Notes

- The frontend uses local JavaScript scripture data and does not call external scripture services.
- The OpenAI API key is only read on the backend from `OPENAI_API_KEY`.
- `POST /api/deep-dive` receives `{ reference, scriptureText, studyMode }` and returns an AI study response.
- The app includes `/api/status` so the right panel can tell whether ChatGPT is actually connected.

## Web Deployment

See [DEPLOY.md](DEPLOY.md) for a simple production setup. The short version: deploy this as a Node web service, not as static HTML only.
