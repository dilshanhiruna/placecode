const fs = require("fs-extra");
const path = require("path");

// Define the selected options here
const selectedOptions = {
  option1: true,
  option2: true,
  option3: true,
  option4: true,
  option5: true,
  option6: true,
  option7: true,
  option8: true,
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
      for (const [option, isSelected] of Array.from(
        Object.entries(selectedOptions)
      )) {
        const pattern = new RegExp(
          `// RA:START:.*${option}.*[\\s\\S]*?// RA:END\\s*`,
          "g"
        );

        // Get the code block that matches the pattern
        const codeBlocks = content.match(pattern) || [];

        for (const codeBlock of codeBlocks) {
          if (!isSelected) {
            // if the option is selected

            // Get the options from the start marker
            const regex = /RA:START:\s*([^/\n\r]*)/;

            const options = codeBlock
              .toString()
              .match(regex)?.[1]
              .split(/\s*,\s*/);

            // if options are more than one, check if all options are false
            // if yes, remove the code block
            if (Array.isArray(options) && options.length > 1) {
              const allOptionsFalse = options.every((option) => {
                return !selectedOptions[option];
              });

              if (allOptionsFalse) {
                content = content.replace(pattern, "");
              }
            } else {
              // if only one option, remove the code block
              content = content.replace(pattern, "");
            }
          } else {
            // if the option is selected
            // Check if this code block has a depends marker
            const dependsRegex = /RA:DEPENDS:\s*([^/\n\r]*)/;
            const [dependsMatch] = codeBlock.match(dependsRegex) || [];

            const dependsOnOptions = dependsMatch
              ? dependsMatch
                  .toString()
                  .match(dependsRegex)?.[1]
                  .split(/\s*,\s*/)
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

              console.log(areAllDependenciesSelected);

              if (!areAllDependenciesSelected) {
                // Remove the code block
                content = content.replace(pattern, "");
              }
            }
          }
        }
      }

      // Remove all comment markers
      const markerPattern = /\/\/ RA:(START|END|DEPENDS)[^\r\n]*\r?\n/g;
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
