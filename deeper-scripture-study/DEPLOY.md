# Deploying Deeper Scripture Study

This app needs a web host that can run a Node/Express server. Do not deploy it as static HTML only, because the OpenAI API key must stay on the server.

## Recommended Simple Setup

Use one Node web service on a host such as Render, Railway, Fly.io, or a VPS.

### 1. Put The App In A Git Repository

Create a repo containing the files in this folder:

```text
deeper-scripture-study/
  package.json
  server.js
  public/
```

Do not commit `.env` or your OpenAI API key.

### 2. Create A Node Web Service

Use these settings:

```text
Build command: npm install
Start command: npm start
Health check path: /health
```

The host should set `PORT` automatically. The app already reads `process.env.PORT`.

### 3. Add Environment Variables

In the hosting dashboard, add:

```text
OPENAI_API_KEY=your_real_key
OPENAI_MODEL=gpt-5.5
```

Never put `OPENAI_API_KEY` in frontend code.

### 4. Open The Hosted URL

Once deployed, open the service URL. The right panel should show that ChatGPT deep dives are connected.

## Why This Works

- The browser loads scripture text from `public/scripture-data-full.js`.
- The browser sends selected scripture text and study mode to `/api/deep-dive`.
- The Express server calls OpenAI using `OPENAI_API_KEY`.
- The API key is never visible in the browser.

## Static Hosting Alone Will Not Work

Hosts like plain GitHub Pages or a simple static file upload can show the scripture selector, but cannot securely call OpenAI. They would either fail or require exposing the API key, which should not be done.
