const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-5.5";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("Request too large"));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function safeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function markdownToHtml(text) {
  const lines = text.split(/\r?\n/);
  let html = "";
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }

    if (line.startsWith("### ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h3>${safeHtml(line.slice(4))}</h3>`;
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${safeHtml(line.slice(2))}</li>`;
      continue;
    }

    if (inList) {
      html += "</ul>";
      inList = false;
    }
    html += `<p>${safeHtml(line)}</p>`;
  }

  if (inList) html += "</ul>";
  return html;
}

function hasImportedText(item) {
  return item.text && !String(item.text).includes("Full chapter text has not been imported yet");
}

function describePassage(item, index) {
  const lines = [
    `${index + 1}. ${item.reference} (${item.source})`
  ];

  if (item.isChapterSelection) {
    lines.push(`Selection type: entire chapter`);
    lines.push(`Book: ${item.book}`);
    lines.push(`Chapter: ${item.chapter}`);

    if (hasImportedText(item)) {
      lines.push("Full chapter text provided:");
      lines.push(item.text);
    } else {
      lines.push("Full chapter text was not provided by the app.");
      lines.push(`Analyze the entire chapter by reference: ${item.reference}.`);
      lines.push("Use your scripture knowledge for the chapter-level overview, but avoid long verbatim quotation unless text is supplied.");
    }

    return lines.join("\n");
  }

  lines.push("Selection type: passage or verse");
  lines.push("Supplied text:");
  lines.push(item.text || "(No text supplied.)");
  return lines.join("\n");
}

async function deepDive(req, res) {
  const { passages = [], modes = [] } = await readJson(req);
  if (!Array.isArray(passages) || !passages.length) {
    send(res, 400, JSON.stringify({ error: "Select at least one passage." }), "application/json; charset=utf-8");
    return;
  }

  if (!apiKey) {
    send(res, 503, JSON.stringify({ error: "OPENAI_API_KEY is not set." }), "application/json; charset=utf-8");
    return;
  }

  const scriptureBlock = passages.map(describePassage).join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      instructions: [
        "You are a careful scripture study assistant.",
        "Respect the user's religious context. Do not claim official doctrinal authority.",
        "Give a realistic, text-specific deep dive rather than a generic devotional summary.",
        "Name the selected references directly throughout the response.",
        "Use supplied passage text when present. Quote or point to short key phrases from the supplied text and explain why those phrases matter.",
        "When an entire chapter reference is supplied without full text, still analyze that whole chapter by reference. Summarize its storyline, major turns, people, choices, consequences, doctrinal ideas, and study questions. Say that exact wording was not supplied, and avoid long verbatim quotation.",
        "For each passage, discuss immediate meaning, important words, likely speaker/audience where clear, doctrinal themes, and practical invitations.",
        "When multiple passages are selected, compare them specifically instead of speaking only about 'the selected passage'.",
        "Clearly label cross-reference suggestions.",
        "Return Markdown with these headings: Overview, Passage-by-Passage, Key Phrases, Connections, Application, Study Questions."
      ].join(" "),
      input: `Selected study modes: ${modes.join(", ") || "All"}\n\nPassages:\n${scriptureBlock}`
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    send(res, response.status, JSON.stringify({ error: errorText }), "application/json; charset=utf-8");
    return;
  }

  const data = await response.json();
  send(res, 200, JSON.stringify({ html: markdownToHtml(data.output_text || "No study notes returned.") }), "application/json; charset=utf-8");
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/deep-dive") {
      await deepDive(req, res);
      return;
    }

    const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const filePath = path.normalize(path.join(root, requestPath === "/" ? "index.html" : requestPath));
    if (!filePath.startsWith(root)) {
      send(res, 403, "Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        send(res, 404, "Not found");
        return;
      }
      send(res, 200, data, contentTypes[path.extname(filePath)] || "application/octet-stream");
    });
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }), "application/json; charset=utf-8");
  }
});

server.listen(port, () => {
  console.log(`Scripture Study app running at http://localhost:${port}`);
  if (!apiKey) console.log("Set OPENAI_API_KEY before launching to enable live AI deep dives.");
});
