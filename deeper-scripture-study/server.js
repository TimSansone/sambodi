const express = require("express");
const path = require("node:path");

const app = express();
const port = Number(process.env.PORT || 4173);
const model = process.env.OPENAI_MODEL || "gpt-5.5";

app.use(express.json({ limit: "4mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

function markdownToHtml(markdown) {
  const escaped = String(markdown)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^\- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>")
    .replace(/<p><h/g, "<h")
    .replace(/<\/h([23])><\/p>/g, "</h$1>")
    .replace(/<p><ul>/g, "<ul>")
    .replace(/<\/ul><\/p>/g, "</ul>");
}

app.get("/api/status", (req, res) => {
  res.json({
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model
  });
});

app.post("/api/deep-dive", async (req, res) => {
  try {
    const { reference, scriptureText, studyMode } = req.body || {};

    if (!reference || !scriptureText || !studyMode) {
      return res.status(400).json({
        error: "reference, scriptureText, and studyMode are required."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "OPENAI_API_KEY is not set on the server."
      });
    }

    const prompt = [
      `Study mode requested: ${studyMode}`,
      `Selected scripture: ${reference}`,
      "",
      "Full selected scripture text with verse numbers:",
      scriptureText,
      "",
      "Task:",
      "Write a true deep dive into the selected scripture, like a thoughtful scripture teacher would give after carefully reading the passage.",
      "Do not give a generic devotional answer. Anchor every major point in specific verses, phrases, repeated words, choices, consequences, contrasts, and narrative movement from the supplied text.",
      "",
      "Include these sections as relevant to the requested study mode:",
      "1. Passage Map - walk through the chapter or verses in natural movements.",
      "2. Close Reading - identify important phrases, turns, omissions, repeated words, and tension in the wording.",
      "3. People, Choices, and Consequences - name the people in the passage and trace decisions and results.",
      "4. Historical and Cultural Context - give helpful background, clearly marking any inference.",
      "5. Doctrine and Principles - extract principles directly from the text without claiming official doctrinal authority.",
      "6. Warnings, Invitations, and Personal Application - make the application concrete and tied to the passage.",
      "7. Study Questions - ask questions that would help someone keep studying this exact passage.",
      "",
      "If the selected passage is from the Bible, Book of Mormon, or Doctrine and Covenants, keep the user's Latter-day Saint study context in mind while remaining careful and text-grounded.",
      "Use short quotations only from the supplied scripture text. Distinguish clearly between what the text says and what you are inferring from context.",
      "Aim for depth over brevity."
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: "medium" },
        max_output_tokens: 3500,
        instructions: [
          "You are a careful, text-grounded scripture study assistant.",
          "Your job is close reading, context, doctrine, and application.",
          "Never speak as an official Church authority.",
          "Return Markdown with clear headings and concrete verse references."
        ].join(" "),
        input: prompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json({
      text: data.output_text || "",
      html: markdownToHtml(data.output_text || "No response returned.")
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Deeper Scripture Study running at http://localhost:${port}`);
});
