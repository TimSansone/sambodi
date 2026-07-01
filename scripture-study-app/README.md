# Scripture Study App

This is a local prototype for selecting multiple scripture passages and generating an AI-assisted deep dive.

You can also open `index.html` directly for the no-key prototype experience.

## Open the app

From this folder, run:

```powershell
node server.js
```

If `node` is not on your PATH in Codex, use the bundled runtime:

```powershell
& "C:\Users\solrb\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

Then open:

```text
http://localhost:4173
```

The app works without an API key by using a built-in study-note generator.

Use the book dropdown under each scripture source to choose a book, then click chapter numbers to auto-add whole chapters to your selected scriptures.

## Full scripture library

The app can import a permitted scripture text library from a JSON file. Use the **Full text library** import field in the app.

Supported formats:

```json
[
  {
    "source": "Bible",
    "book": "2 Samuel",
    "chapter": 1,
    "text": "Full chapter text..."
  },
  {
    "source": "Book of Mormon",
    "book": "Alma",
    "chapter": 32,
    "verse": 21,
    "reference": "Alma 32:21",
    "text": "Verse text..."
  }
]
```

Use scripture text you have permission to use. The King James Version is public domain in the United States, but Church website materials have their own terms of use.

## Enable live OpenAI deep dives

Set your API key before starting the server:

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
node server.js
```

Optional model override:

```powershell
$env:OPENAI_MODEL="gpt-5.5"
node server.js
```

The local server sends selected passages to the OpenAI Responses API and returns study notes to the right panel. If you select a whole chapter, such as **2 Samuel 11**, the app sends that reference to ChatGPT as an entire-chapter deep dive request. If you also import full scripture text, the app sends the exact text too.

With the bundled Codex runtime, the live ChatGPT version can be started like this:

```powershell
cd C:\Users\solrb\Documents\Codex\2026-06-23\i-d\outputs\scripture-study-app
$env:OPENAI_API_KEY="your_api_key_here"
& "C:\Users\solrb\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

Then open:

```text
http://localhost:4173
```
