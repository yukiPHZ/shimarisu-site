const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const publicDir = path.join(__dirname, "..", "public");
let checked = 0;
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { scan(file); continue; }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const html = fs.readFileSync(file, "utf8");
    const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0];
    if (!footer) continue;
    checked++;
    assert.doesNotMatch(footer, /菊田\s*幸彦|Yukihiko Kikuta|creator_profile|Vibe-coded by|<a href="\/about">プロフィール<\/a>/i, file);
  }
}
scan(publicDir);
assert.equal(checked, 38);
assert.match(fs.readFileSync(path.join(publicDir, "about.html"), "utf8"), /菊田\s*幸彦/);
console.log(`FOOTER_POLICY_PASS pages=${checked}`);
