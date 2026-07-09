import { readFile } from "node:fs/promises";

const html = await readFile("outputs/gang-sheet-13x19-tool/index.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);

for (const script of scripts) {
  new Function(script);
}

console.log(JSON.stringify({
  scripts: scripts.length,
  syntax: "ok",
  bytes: html.length,
  fixedSizeCopy: html.includes("Only 13 x 19 inch gang sheets are available"),
  hasCustomOption: html.includes('value="custom"') || html.includes("Custom size"),
  hasOtherPresets: html.includes("22 x 24") || html.includes("22x24"),
  hasSheetSizeInputs: html.includes("sheetWidthInput\" type=") || html.includes("sheetHeightInput\" type="),
  hasThirteenByNineteen: html.includes("13 x 19")
}, null, 2));
