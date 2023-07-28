const fs = require("fs-extra");
const path = require("path");
const { regex_reuse_marker } = require("./regex");
const { snippetsDir } = require("../config.json");

function placeSnippets(content) {
  const matches = [...content.matchAll(regex_reuse_marker)];

  for (const match of matches) {
    const filename = match[1];
    const filePath = path.join(snippetsDir, filename);

    if (fs.existsSync(filePath)) {
      const reusableCode = fs.readFileSync(filePath, "utf-8");
      content = content.replace(match[0], reusableCode);
    } else {
      console.warn(`Reusable code file ${filePath} not found.`);
    }
  }

  return content;
}

module.exports = placeSnippets;
