const fs = require("fs");
const path = require("path");
const {
  regex_start_string_marker,
  regex_depend_string_marker,
  regex_end_string_marker,
} = require("./regex");

function formatCommentMarkersInFiles(sourceDir) {
  const startRegex = /\/\/\s*ZPC\s*:\s*START:([^]+?)\n/g;
  const dependsRegex = /\/\/\s*ZPC\s*:\s*DEPENDS:([^]+?)\n/g;
  const endRegex = /\/\/\s*ZPC\s*:\s*END:([^]+?)\n/g;

  function formatCommentMarkers(code) {
    let formattedCode = code;

    formattedCode = formattedCode.replace(startRegex, (match, options) => {
      const formattedOptions = options.trim().replace(/\s*,\s*/g, ", ");
      return `${regex_start_string_marker} ${formattedOptions}\n`;
    });

    formattedCode = formattedCode.replace(dependsRegex, (match, options) => {
      const formattedOptions = options.trim().replace(/\s*,\s*/g, ", ");
      return `${regex_depend_string_marker} ${formattedOptions}\n`;
    });

    formattedCode = formattedCode.replace(endRegex, (match, options) => {
      const formattedOptions = options.trim().replace(/\s*,\s*/g, ", ");
      return `${regex_end_string_marker} ${formattedOptions}\n`;
    });

    return formattedCode;
  }

  function formatCommentMarkersInFile(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const formattedContent = formatCommentMarkers(fileContent);
    fs.writeFileSync(filePath, formattedContent, "utf8");
  }

  function traverseDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        if (filePath.endsWith(".js")) {
          formatCommentMarkersInFile(filePath);
        }
      } else if (stats.isDirectory()) {
        traverseDirectory(filePath);
      }
    }
  }

  traverseDirectory(sourceDir);
}

module.exports = formatCommentMarkersInFiles;
