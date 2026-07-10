const DEFAULT_BRANCH = "main";
const DEFAULT_MOCKUP_DIR = "customer-mockups";

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function safeFilePart(value) {
  return String(value || "mockup")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "mockup";
}

function normalizeDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:image\/png;base64,(.+)$/);
  return match ? match[1] : "";
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { ok: false, error: "POST requests only." });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const mockupDir = process.env.GITHUB_MOCKUP_DIR || DEFAULT_MOCKUP_DIR;

  if (!token || !owner || !repo) {
    return sendJson(response, 500, {
      ok: false,
      error: "GitHub backup is not configured. Add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in Vercel."
    });
  }

  let body = {};
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  } catch {
    return sendJson(response, 400, { ok: false, error: "Invalid request data." });
  }
  const pngBase64 = normalizeDataUrl(body.pngDataUrl);

  if (!pngBase64) {
    return sendJson(response, 400, { ok: false, error: "Missing PNG image data." });
  }

  const metadata = body.metadata || {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const product = safeFilePart(metadata.product || "t-shirt");
  const view = safeFilePart(metadata.view || "mockup");
  const filename = safeFilePart(body.filename || `${product}-${view}-${timestamp}.png`);
  const path = `${mockupDir.replace(/^\/+|\/+$/g, "")}/${timestamp}-${filename}`;

  const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sambodi-tshirt-mockup-tool"
    },
    body: JSON.stringify({
      message: `Save customer mockup ${filename}`,
      content: pngBase64,
      branch
    })
  });

  const githubResult = await githubResponse.json().catch(() => ({}));

  if (!githubResponse.ok) {
    return sendJson(response, githubResponse.status, {
      ok: false,
      error: githubResult.message || "GitHub upload failed."
    });
  }

  return sendJson(response, 200, {
    ok: true,
    path,
    url: githubResult.content?.html_url || ""
  });
};
