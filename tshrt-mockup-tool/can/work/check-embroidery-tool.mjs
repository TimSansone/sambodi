import { readFile } from "node:fs/promises";

const html = await readFile("outputs/embroidery-polo-cap-mockup-tool/index.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);

for (const script of scripts) {
  new Function(script);
}

console.log(JSON.stringify({
  scripts: scripts.length,
  syntax: "ok",
  bytes: html.length,
  hasTitle: html.includes("Embroidery Mockup Tool"),
  hasPolo: html.includes('name: "Polo Shirt"'),
  hasCap: html.includes('name: "Baseball Cap"'),
  hasTshirt: html.includes('name: "T-Shirt"'),
  hasEmail: html.includes("mailto:info@sambodicreations.com"),
  hasDelete: html.includes("deleteArtBtn"),
  hasFrontBack: html.includes('front: { label: "Front"') && html.includes('back: { label: "Back"'),
  hasEmbroideryTreatment: html.includes('state.product === "polo" || state.product === "hat"')
}, null, 2));
