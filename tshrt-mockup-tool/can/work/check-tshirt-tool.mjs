import { readFile } from "node:fs/promises";

const html = await readFile("outputs/tshirt-mockup-tool/index.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);

for (const script of scripts) {
  new Function(script);
}

console.log(JSON.stringify({
  scripts: scripts.length,
  syntax: "ok",
  bytes: html.length,
  hasTitle: html.includes("T-Shirt Mockup Tool"),
  hasTshirt: html.includes('name: "T-Shirt"'),
  hasPolo: html.includes('name: "Polo"'),
  hasHat: html.includes("Baseball Cap"),
  hasEmail: html.includes("mailto:info@sambodicreations.com"),
  hasDelete: html.includes("deleteArtBtn"),
  hasFrontBack: html.includes('front: { label: "Front"') && html.includes('back: { label: "Back"')
}, null, 2));
