const fs = require("fs-extra");
const path = require("path");

// Define the selected options here
const selectedOptions = {
  option1: true,
  option2: true,
  option3: false,
  option4: true,
  option5: true,
  option6: true,
  option7: true,
  option8: true,
  option9: true,
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
          // `// RA:START:.*${option}.*[\\s\\S]*?// RA:END:.*${option}\\s*`,
          `// RA:START:.*${option}.*[\\s\\S]*?// RA:END:.*${option}.*(?:\r?\n|$)`,
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
                `// RA:DEPENDS:\\s*${dependsOnOptions.join("\\s*,\\s*")}\\s*`
              );

              if (!areAllDependenciesSelected) {
                // remove only the code block that has the depends marker
                for (match of codeBlock.match(pattern)) {
                  if (dependRegex.test(match)) {
                    // Remove the code block
                    content = content.replace(match, "");
                  }
                }
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

// This function will recursively traverse the directory tree
// and process any zpc.txt files it finds
function processPlacecodeFiles(directory) {
  try {
    // Get a list of files and folders in the current directory
    const files = fs.readdirSync(directory);

    // Check for the existence of a zpc.txt file
    if (files.includes("zpc.txt")) {
      const placecodePath = path.join(directory, "zpc.txt");

      // Read the contents of the zpc.txt file
      const placecodeContents = fs.readFileSync(placecodePath, "utf-8");

      // Process the placecode contents for each option
      for (const [option, isSelected] of Array.from(
        Object.entries(selectedOptions)
      )) {
        const pattern = new RegExp(
          // `// RA:START:.*${option}.*[\\s\\S]*?// RA:END:.*${option}\\s*`,
          `// RA:START:.*${option}.*[\\s\\S]*?// RA:END:.*${option}.*(?:\r?\n|$)`,
          "g"
        );

        // Get the code block that matches the pattern
        const matches = placecodeContents.match(pattern) || [];

        for (const match of matches) {
          if (!isSelected) {
            // Get the options from the start marker
            const regex = /RA:START:\s*([^/\n\r]*)/;

            const options = match
              .toString()
              .match(regex)?.[1]
              .split(/\s*,\s*/);

            // get the defined files and folders
            const pattern = /\/\/ RA:START:.*?\n([\s\S]*?)\/\/ RA:END:.*?\n/g;
            const matches = [...match.matchAll(pattern)];
            const result = matches
              .map((match) => match[1].split("\n").filter(Boolean))
              .flat();

            // avoid duplicates names
            const uniqueFiles = [...new Set(result)];

            // if options are more than one, check if all options are false
            // if yes, remove the code block
            if (Array.isArray(options) && options.length > 1) {
              const allOptionsFalse = options.every((option) => {
                return !selectedOptions[option];
              });

              if (allOptionsFalse) {
                removeFiles(uniqueFiles, directory);
              }
            } else {
              removeFiles(uniqueFiles, directory);
            }
          } else {
            // if the option is selected
            // Check if this code block has a depends marker
            const dependsRegex = /RA:DEPENDS:\s*([^/\n\r]*)/;
            const [dependsMatch] = match.match(dependsRegex) || [];

            const dependsOnOptions = dependsMatch
              ? dependsMatch
                  .toString()
                  .match(dependsRegex)?.[1]
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
                `// RA:DEPENDS:\\s*${dependsOnOptions.join("\\s*,\\s*")}\\s*`
              );

              if (!areAllDependenciesSelected) {
                // get the defined files and folders
                const pattern =
                  /\/\/ RA:START:.*?\n([\s\S]*?)\/\/ RA:END:.*?\n/g;
                const matches = [...match.matchAll(pattern)];
                const result = matches
                  .map((match) => match[1].split("\n").filter(Boolean))
                  .flat();

                // avoid duplicates names
                // remove elements that have a DEPENDS marker from the array
                const uniqueFiles = [...new Set(result)].filter((file) => {
                  return !file.match(dependRegex);
                });

                // remove the files and folders
                removeFiles(uniqueFiles, directory);
              }
            }
          }
        }
      }

      // Remove the zpc.txt file
      fs.unlink(placecodePath);
    }
    // Recursively process any subdirectories
    for (const file of files) {
      const filePath = path.join(directory, file);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        processPlacecodeFiles(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing placecode files: ${error}`);
  }
}

function removeFiles(targetsArray, directory) {
  // Remove the specified files and folders
  for (const target of targetsArray) {
    const targetPath = path.join(directory, target);
    try {
      if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        if (stats.isDirectory()) {
          fs.rm(targetPath, { recursive: true });
        } else {
          fs.unlink(targetPath);
        }
      }
    } catch (error) {
      console.error(`Error removing ${targetPath}: ${error}`);
    }
  }
}

function main() {
  if (!checkCommentMarkers(sourceDir)) {
    // Recursively copy the source directory to the destination directory
    fs.copySync(sourceDir, destDir);
    processPlacecodeFiles(destDir);
    generateTemplate(destDir);
  }
}

main();
