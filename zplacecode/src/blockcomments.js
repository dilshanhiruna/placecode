const fs = require("fs-extra");
const path = require("path");
const {
  regex_start_to_end_options,
  regex_start_marker,
  regex_depends_marker,
  regex_depends_with_options,
  regex_file_ignore,
  regex_zpc_lines_start,
} = require("./regex");
const { ignore } = require("../config.json");
const placeSnippets = require("./forsnippets");

async function blockComments(dir, selectedOptions) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    // check if the directory is in the ignore list
    if (ignore.includes(file)) {
      continue;
    }
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    // check if the file is a directory
    if (stat.isDirectory()) {
      blockComments(filePath, selectedOptions);
    } else {
      // Read the file contents
      let content = fs.readFileSync(filePath, "utf8");

      // check if the file is already ignored
      if (regex_file_ignore.test(content)) {
        continue;
      }

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
          if (!isSelected) {
            // if the option is not selected

            const options = codeBlock
              .toString()
              .match(regex_start_marker)?.[1]
              .split(/\s*,\s*/);

            // if options are more than one, check if all options are false
            // if yes, remove the code block
            if (Array.isArray(options) && options.length > 1) {
              const allOptionsFalse = options.every((option) => {
                return !selectedOptions[option];
              });

              if (allOptionsFalse) {
                // Comment out all lines in the code block
                const commentedBlock = commentCodeLines(codeBlock);
                content = content.replace(codeBlock, commentedBlock);
              }
            } else {
              // Comment out all lines in the code block
              const commentedBlock = commentCodeLines(codeBlock);
              content = content.replace(codeBlock, commentedBlock);
            }
          } else {
            // if the option is selected
            // Check if this code block has a depends marker
            const [dependsMatch] = codeBlock.match(regex_depends_marker) || [];

            const dependsOnOptions = dependsMatch
              ? dependsMatch
                  .toString()
                  .match(regex_depends_marker)?.[1]
                  .split(/\s*,\s*/)
                  .filter(Boolean)
              : [];

            if (
              Array.isArray(dependsOnOptions) &&
              dependsOnOptions.length > 0
            ) {
              // Check if all the required options are selected
              const areAllDependenciesSelected = dependsOnOptions.every(
                (option) => {
                  return selectedOptions[option];
                }
              );

              const dependRegex = new RegExp(
                regex_depends_with_options(dependsOnOptions)
              );

              if (!areAllDependenciesSelected) {
                // remove only the code block that has the depends marker
                for (match of codeBlock.match(pattern)) {
                  if (dependRegex.test(match)) {
                    // Comment out all lines in the code block
                    const commentedBlock = commentCodeLines(match);
                    content = content.replace(match, commentedBlock);
                  }
                }
              }
            }
          }
        }
      }

      // Write the modified file contents back to the file
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

function commentCodeLines(codeBlock) {
  return codeBlock
    .split("\n")
    .map((line, i, arr) =>
      regex_zpc_lines_start.test(line)
        ? line
        : i === arr.length - 1
        ? line
        : `// ${line}`
    )
    .join("\n");
}

module.exports = blockComments;
