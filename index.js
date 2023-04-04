const fs = require("fs-extra");
const path = require("path");

// Define the selected options here
const selectedOptions = {
  option1: true,
  option2: false,
  option3: true,
  option4: true,
};

// Define the source and destination directories
const sourceDir = "./templates";
const destDir = "./output";

function generateTemplate(dirPath) {
  // Recursively copy the source directory to the destination directory
  fs.copySync(dirPath, destDir);

  const files = fs.readdirSync(destDir);
  for (const file of files) {
    const filePath = path.join(destDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      generateTemplate(filePath);
    } else {
      // Read the file contents
      let content = fs.readFileSync(filePath, "utf8");

      // Check if all comment markers are properly formatted
      if (!checkCommentMarkers(content)) {
        console.error(`Error in file '${filePath}'`);
        break;
      }

      // Loop through each option and remove the unselected blocks
      for (const [option, isSelected] of Object.entries(selectedOptions)) {
        if (!isSelected) {
          // Remove the block of code between the start and end markers for this option
          const pattern = new RegExp(
            `// RA:START: ${option}[\\s\\S]*?// RA:END: ${option}\\s*`,
            "g"
          );
          content = content.replace(pattern, "");
        }
      }

      // Remove all comment markers
      const markerPattern = /\/\/ RA:(START|END): [^\r\n]*\r?\n/g;
      content = content.replace(markerPattern, "");

      // Write the modified file contents back to the file
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}
function checkCommentMarkers(contents) {
  const blocks = {};
  let currentBlock = null;

  const lines = contents.split("\n");
  for (const line of lines) {
    const startMatch = line.match(/^\/\/ RA:START:\s*(\w+)\s*$/);
    if (startMatch) {
      const blockName = startMatch[1];
      currentBlock = blocks[blockName] || { starts: [], ends: [] };
      currentBlock.starts.push(line);
      blocks[blockName] = currentBlock;
    }

    const endMatch = line.match(/^\/\/ RA:END:\s*(\w+)\s*$/);
    if (endMatch) {
      const blockName = endMatch[1];
      if (!blocks[blockName]) {
        console.error(
          `Invalid comment marker format: no RA:START marker found for '${blockName}'`
        );
        return false;
      }
      currentBlock = blocks[blockName];
      currentBlock.ends.push(line);
      if (currentBlock.ends.length > currentBlock.starts.length) {
        console.error(
          `Invalid comment marker format: multiple RA:END markers found for '${blockName}'`
        );
        return false;
      }
    }
  }

  for (const blockName of Object.keys(blocks)) {
    const { starts, ends } = blocks[blockName];
    if (starts.length !== ends.length) {
      console.error(
        `Invalid comment marker format: mismatched RA:START and RA:END markers for '${blockName}'`
      );
      return false;
    }
  }

  return true;
}

generateTemplate(sourceDir);
