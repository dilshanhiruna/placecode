const fs = require("fs-extra");
const path = require("path");

// Define the selected options here
const selectedOptions = {
  option1: false,
  option2: true,
  option3: true,
  option4: true,
};

// Define the source and destination directories
const sourceDir = "./templates";
const destDir = "./output";

async function generateTemplate(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    console.log(filePath);
    const stat = fs.statSync(filePath);
    // check if the file is a directory
    if (stat.isDirectory()) {
      generateTemplate(filePath);
    } else {
      // Read the file contents
      let content = fs.readFileSync(filePath, "utf8");

      // Loop through each option and remove the unselected blocks
      for (const [option, isSelected] of Object.entries(selectedOptions)) {
        if (!isSelected) {
          // Remove the block of code between the start and end markers for this option
          const pattern = new RegExp(
            `// RA:START: ${option}[\\s\\S]*?// RA:END\\s*`,
            "g"
          );
          content = content.replace(pattern, "");
        }
      }

      // Remove all comment markers
      const markerPattern = /\/\/ RA:(START|END)[^\r\n]*\r?\n/g;
      content = content.replace(markerPattern, "");

      // Write the modified file contents back to the file
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

function checkCommentMarkers(dir) {
  const files = fs.readdirSync(dir);
  let errorFound = false;
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    // check if the file is a directory
    if (stat.isDirectory()) {
      errorFound = checkCommentMarkers(filePath) || errorFound;
    } else {
      // Read the file contents
      let content = fs.readFileSync(filePath, "utf8");

      const startCount = (content.match(/\/\/ RA:START:/g) || []).length;
      const endCount = (content.match(/\/\/ RA:END/g) || []).length;

      if (startCount !== endCount) {
        console.error(`\nMarkers do not match`);
        console.error(`Error in file '${filePath}'`);
        errorFound = true;
        break;
      }
    }
  }
  return errorFound;
}

function main() {
  if (!checkCommentMarkers(sourceDir)) {
    // Recursively copy the source directory to the destination directory
    fs.copySync(sourceDir, destDir);

    generateTemplate(destDir);
  }
}

main();
