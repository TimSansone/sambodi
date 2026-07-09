import { readFile } from "node:fs/promises";

const html = await readFile("outputs/shirt-mockup-app/index.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);

for (const script of scripts) {
  new Function(script);
}

console.log(JSON.stringify({
  scripts: scripts.length,
  syntax: "ok",
  bytes: html.length,
  hasUpload: html.includes("Upload Design") || (html.includes("Front Artwork") && html.includes("Back Artwork")),
  hasExport: html.includes("Export PNG") || html.includes("Generate PNGs"),
  hasFrontBack: html.includes('data-value="front"') && html.includes('data-value="back"'),
  hasNeckOptions: html.includes('data-value="crew"') && html.includes('data-value="v"'),
  hasSleeveOptions: html.includes('data-value="short"') && html.includes('data-value="long"')
}, null, 2));
