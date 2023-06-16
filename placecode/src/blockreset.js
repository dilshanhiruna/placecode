const fs = require("fs-extra");
const path = require("path");
const {
  regex_start_to_end_options,
  regex_file_ignore,
  regex_zpc_lines,
} = require("./regex");
const { ignore } = require("../config.json");
const placeSnippets = require("./forsnippets");

async function blockReset(dir, selectedOptions) {
  // restore moved files
  restoreMovedFiles();

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
      blockReset(filePath, selectedOptions);
    } else {
      // Read the file contents
      let content = fs.readFileSync(filePath, "utf8");

      // Place the snippets
      content = placeSnippets(content);

      // remove ignorefile comments if any
      content = content.replace(regex_file_ignore, "");

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
      if (regex_zpc_lines.test(line)) {
        // skip lines starting with "// ZPC:" or "ZPC:"
        return line;
      }
      return line.replace(/^\s*\/\/\s*/, ""); // remove leading "// " from the line
    })
    .join("\n");
}

function restoreMovedFiles() {
  const tempDirectory = path.join("placecode/temp");
  const movedFilesDataPath = path.join("placecode/temp/temp_data.json");

  try {
    if (fs.existsSync(movedFilesDataPath)) {
      const movedFilesDataString = fs.readFileSync(movedFilesDataPath, "utf8");
      const movedFilesData = JSON.parse(movedFilesDataString);

      for (const movedFileData of movedFilesData) {
        const { file, originalPath, uniqueFilename } = movedFileData;

        const sourcePath = path.join(tempDirectory, uniqueFilename);
        const destinationPath = path.join(originalPath);

        if (fs.existsSync(sourcePath)) {
          // Move the file or folder back to its original location
          fs.renameSync(sourcePath, destinationPath);
        } else {
          console.warn(`Source file or folder not found: ${sourcePath}`);
        }
      }

      // Remove the temp_data.json file
      fs.unlinkSync(movedFilesDataPath);
    }
  } catch (error) {
    console.error(`Error restoring moved files: ${error}`);
  }
}

module.exports = blockReset;
