const fs = require("fs-extra");
const path = require("path");
const {
  regex_start_to_end_options,
  regex_start_marker,
  regex_depends_marker,
  regex_all_markers_start,
} = require("./regex");
const { ignore } = require("../config.json");

const zpc = "zpc.txt";

function processPlacecodeFiles(directory, selectedOptions) {
  try {
    // Get a list of files and folders in the current directory
    const files = fs.readdirSync(directory);

    // check if the directory is in the ignore list
    if (ignore.includes(files)) {
      return;
    }
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
        processPlacecodeFiles(filePath, selectedOptions);
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

module.exports = processPlacecodeFiles;
