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

function blockFiles(directory, selectedOptions) {
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
                moveFilesnFolders(uniqueFiles, directory);
              }
            } else {
              moveFilesnFolders(uniqueFiles, directory);
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
                moveFilesnFolders(uniqueFiles, directory);
              }
            }
          }
        }
      }
    }
    // Recursively process any subdirectories
    for (const file of files) {
      const filePath = path.join(directory, file);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        blockFiles(filePath, selectedOptions);
      }
    }
  } catch (error) {
    console.error(`Error processing placecode files: ${error}`);
  }
}
function moveFilesnFolders(targetsArray, directory) {
  const tempDirectory = path.join("placecode/temp");
  const movedFilesData = [];

  try {
    for (const target of targetsArray) {
      const sourcePath = path.join(directory, target);

      if (!fs.existsSync(sourcePath)) {
        continue;
      }

      // Generate a unique filename for the destination
      const uniqueFilename = generateUniqueFilename(target);
      const destinationPath = path.join(tempDirectory, uniqueFilename);

      // Create the destination directory if it doesn't exist
      const destinationDir = path.dirname(destinationPath);
      fs.mkdirSync(destinationDir, { recursive: true });

      // Move the file or folder to the temporary directory
      fs.renameSync(sourcePath, destinationPath);

      // Record the moved file and its original location
      const movedFileData = {
        file: target,
        originalPath: path.join(sourcePath),
        uniqueFilename: uniqueFilename,
      };
      movedFilesData.push(movedFileData);
    }
  } catch (error) {
    console.error(`Error moving files and folders to temp directory: ${error}`);
  }

  // Save the moved files data for future restoration
  saveMovedFilesData(movedFilesData);
}

function generateUniqueFilename(filename) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 16);
  const uniqueFilename = `${timestamp}${randomString}_${filename}`;
  return uniqueFilename;
}

function saveMovedFilesData(movedFilesData) {
  const filePath = path.join("placecode/temp/temp_data.json");

  try {
    let existingData = [];

    if (fs.existsSync(filePath)) {
      const existingDataString = fs.readFileSync(filePath, "utf8");
      existingData = JSON.parse(existingDataString);
    }

    const mergedData = existingData.concat(movedFilesData);
    const mergedDataString = JSON.stringify(mergedData);

    fs.writeFileSync(filePath, mergedDataString);
  } catch (error) {
    console.error(`Error saving moved files data: ${error}`);
  }
}

module.exports = blockFiles;
