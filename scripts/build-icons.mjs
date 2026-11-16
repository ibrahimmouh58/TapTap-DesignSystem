// Reads app/icons/svg/<family>/*.svg and writes app/icons/icons.generated.ts
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const root = "app/icons/svg";
const icons = {};

for (const family of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const file of readdirSync(`${root}/${family.name}`).filter((f) => f.endsWith(".svg"))) {
    // "up.line.svg" → name "up", variant "line" | "earth.svg" → name "earth", single version
    const [name, variant] = file.replace(".svg", "").split(".");
    const raw = readFileSync(`${root}/${family.name}/${file}`, "utf8");

    const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24";
    const inner = raw
      .replace(/<\?xml[^>]*>/g, "")
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>/, "")
      // Color comes from the surrounding text: fixed colors become currentColor
      .replace(/(fill|stroke)="(?!none)[^"]*"/g, '$1="currentColor"')
      .replace(/\s+/g, " ")
      .trim();

    if (icons[name] && icons[name].family !== family.name) {
      console.warn(`⚠ "${name}" existe dans "${icons[name].family}" et dans "${family.name}"`);
    }
    icons[name] ??= { family: family.name };
    const entry = { viewBox, inner };
    if (variant === "line" || variant === "filled") icons[name][variant] = entry;
    else icons[name].line = icons[name].filled = entry; // single version: used for both variants
  }
}

// If only one variant exists, it is used for both
for (const v of Object.values(icons)) {
  v.line ??= v.filled;
  v.filled ??= v.line;
}

writeFileSync(
  "app/icons/icons.generated.ts",
  `// Fichier généré par scripts/build-icons.mjs : ne pas modifier à la main\n` +
    `export const icons = ${JSON.stringify(icons, null, 2)} as const;\n`
);
console.log(`${Object.keys(icons).length} icônes générées`);