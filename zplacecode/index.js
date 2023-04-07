const fs = require("fs-extra");
const path = require("path");
const {
  regex_start_to_end_options,
  regex_start_marker,
  regex_depends_marker,
  regex_depends_with_options,
  regex_all_markers,
  regex_start_only_marker,
  regex_end_only_marker,
  regex_all_markers_start,
  regex_reuse_marker,
} = require("./main/regex");

const { sourceDir, destDir, zpc, snippetsDir } = require("./zpc.config.js");

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
  option9: true,
};

async function generateTemplate(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    // check if the file is a directory
    if (stat.isDirectory()) {
      generateTemplate(filePath);
    } else {
      // Read the file contents
      let content = fs.readFileSync(filePath, "utf8");

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
            // if the option is selected

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
                content = content.replace(pattern, "");
              }
            } else {
              // if only one option, remove the code block
              content = content.replace(pattern, "");
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
      content = content.replace(regex_all_markers, "");

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

      const startCount = (content.match(regex_start_only_marker) || []).length;
      const endCount = (content.match(regex_end_only_marker) || []).length;

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
    if (files.includes(zpc)) {
      const placecodePath = path.join(directory, zpc);

      // Read the contents of the zpc.txt file
      const placecodeContents = fs.readFileSync(placecodePath, "utf-8");

      // Process the placecode contents for each option
      for (const [option, isSelected] of Array.from(
        Object.entries(selectedOptions)
      )) {
        const pattern = new RegExp(regex_start_to_end_options(option), "g");

        // Get the code block that matches the pattern
        const matches = placecodeContents.match(pattern) || [];

        for (const match of matches) {
          // get the defined files and folders
          const result = match
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0)
            .filter((element) => {
              return !element.startsWith(regex_all_markers_start);
            });

          // avoid duplicates names
          const uniqueFiles = [...new Set(result)];

          if (!isSelected) {
            // Get the options from the start marker
            const options = match
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
                removeFiles(uniqueFiles, directory);
              }
            } else {
              removeFiles(uniqueFiles, directory);
            }
          } else {
            // if the option is selected
            // Check if this code block has a depends marker
            const [dependsMatch] = match.match(regex_depends_marker) || [];

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

              if (!areAllDependenciesSelected) {
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

function main() {
  if (!checkCommentMarkers(sourceDir)) {
    // Recursively copy the source directory to the destination directory
    fs.copySync(sourceDir, destDir);
    processPlacecodeFiles(destDir);
    generateTemplate(destDir);
  }
}

main();
