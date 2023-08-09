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
  ".json",
  ".css",
  ".scss",
  ".less",
  ".html",
  ".md",
  ".mdx",
  ".yaml",
  ".yml",
  ".toml",
];

const parserMappings = {
  ".js": "babel",
  ".mjs": "babel",
  ".jsx": "babel",
  ".cjs": "babel",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".vue": "vue",
  ".graphql": "graphql",
  ".gql": "graphql",
  ".json": "json",
  ".css": "css",
  ".scss": "scss",
  ".less": "less",
  ".html": "html",
  ".md": "markdown",
  ".mdx": "mdx",
  ".yaml": "yaml",
  ".yml": "yaml",
};

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

async function usePrettier(sourceDir, ignore) {
  try {
    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
      const sourceFile = path.join(sourceDir, file);
      const sourceStats = fs.statSync(sourceFile);

      if (ignore.includes(file)) {
        continue;
      }

      if (sourceStats.isDirectory()) {
        await usePrettier(sourceFile, ignore);
      } else {
        if (await isFormattableByPrettier(sourceFile)) {
          const extension = path.extname(sourceFile);
          const parser = parserMappings[extension] || "babel";
          const fileContent = fs.readFileSync(sourceFile, "utf-8");
          const formattedContent = await prettier.format(fileContent, {
            parser: parser,
            singleQuote: true,
            trailingComma: "all",
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
