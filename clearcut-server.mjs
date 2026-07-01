import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 41728;
const root = normalize(join(dirname(fileURLToPath(import.meta.url)), "..", "dist"));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    let requested = normalize(join(root, pathname === "/" ? "index.html" : pathname.slice(1)));

    if (!requested.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    try {
      const info = await stat(requested);
      if (info.isDirectory()) requested = join(requested, "index.html");
    } catch {
      requested = join(root, "index.html");
    }

    const content = await readFile(requested);
    response.writeHead(200, {
      "Content-Type": types[extname(requested).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    });
    response.end(content);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Clearcut server error: ${error.message}`);
  }
});

server.on("error", (error) => {
  if (error.code !== "EADDRINUSE") {
    console.error(error);
    process.exitCode = 1;
  }
});

server.listen(PORT, "127.0.0.1");
