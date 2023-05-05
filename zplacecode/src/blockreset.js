const fs = require("fs-extra");
const path = require("path");
const { regex_start_to_end_options } = require("./regex");
const { ignore } = require("../config.json");
const placeSnippets = require("./forsnippets");

async function blockReset(dir, selectedOptions) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    // check if the file is a directory
    if (stat.isDirectory()) {
      // check if the directory is in the ignore list
      if (ignore.includes(file)) {
        continue;
      }
      blockReset(filePath, selectedOptions);
    } else {
      // Read the file contents
      let content = fs.readFileSync(filePath, "utf8");

      // Place the snippets
      content = placeSnippets(content);

      // Loop through each option and remove the unselected blocks
      for (const [option, isSelected] of Array.from(
        Object.entries(selectedOptions)
      )) {
        const pattern = new RegExp(regex_start_to_end_options(option), "g");

        // Get the code block that matches the pattern
        const codeBlocks = content.match(pattern) || [];

        for (const codeBlock of codeBlocks) {
          // Comment out all lines in the code block
          const commentedBlock = uncommentCodeLines(codeBlock);
          content = content.replace(codeBlock, commentedBlock);
        }
      }

      // Write the modified file contents back to the file
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

function uncommentCodeLines(codeBlock) {
  return codeBlock
    .split("\n")
    .map((line) => {
      if (/^(\s*\/\/\s*ZPC:)|^(\s*ZPC:)/.test(line)) {
        // skip lines starting with "// ZPC:" or "ZPC:"
        return line;
      }
      return line.replace(/^\s*\/\/\s*/, ""); // remove leading "// " from the line
    })
    .join("\n");
}

module.exports = blockReset;
