const prettier = require("prettier");
const fs = require("fs");
const path = require("path");

const supportedExtensions = [
  ".js",
  ".mjs",
  ".jsx",
  ".cjs",
  ".ts",
  ".tsx",
  ".vue",
  ".graphql",
  ".gql",
];

// Helper function to check if a file is supported by Prettier
async function isFormattableByPrettier(filePath) {
  try {
    const fileInfo = await prettier.getFileInfo(filePath);
    return (
      fileInfo &&
      fileInfo.ignored === false &&
      fileInfo.inferredParser !== null &&
      supportedExtensions.includes(path.extname(filePath))
    );
  } catch (error) {
    console.error("Error checking Prettier support:", error);
    return false;
  }
}

// Helper function to format files using Prettier
async function usePrettier(sourceDir, ignore) {
  try {
    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
      const sourceFile = path.join(sourceDir, file);
      const sourceStats = fs.statSync(sourceFile);

      // Check if the source item is in the ignore list
      if (ignore.includes(file)) {
        continue; // Skip formatting for ignored files and directories
      }

      // Check if the source item is a directory
      if (sourceStats.isDirectory()) {
        await usePrettier(sourceFile, ignore);
      } else {
        // Check if the file is supported by Prettier before formatting
        if (await isFormattableByPrettier(sourceFile)) {
          // Format the file using Prettier
          const fileContent = fs.readFileSync(sourceFile, "utf-8");
          const formattedContent = await prettier.format(fileContent, {
            parser: "babel",
            singleQuote: true, // Use single quotes for strings
            trailingComma: "all", // Add trailing commas for multiline arrays and objects
          });

          fs.writeFileSync(sourceFile, formattedContent, "utf-8");
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = usePrettier;
