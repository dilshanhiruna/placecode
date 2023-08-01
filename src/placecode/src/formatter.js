const fs = require("fs");
const path = require("path");
const {
  regex_start_string_marker,
  regex_depend_string_marker,
  regex_end_string_marker,
  fmt_start_regex,
  fmt_depends_regex,
  fmt_end_regex,
} = require("./regex");

function formatCommentMarkersInFiles(sourceDir, ignore) {
  function formatCommentMarkers(code) {
    let formattedCode = code;

    formattedCode = formattedCode.replace(fmt_start_regex, (match, options) => {
      const formattedOptions = options.trim().replace(/\s*,\s*/g, ", ");
      return `${regex_start_string_marker} ${formattedOptions}\n`;
    });

    formattedCode = formattedCode.replace(
      fmt_depends_regex,
      (match, options) => {
        const formattedOptions = options.trim().replace(/\s*,\s*/g, ", ");
        return `${regex_depend_string_marker} ${formattedOptions}\n`;
      }
    );

    formattedCode = formattedCode.replace(fmt_end_regex, (match, options) => {
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
      if (ignore.includes(file)) {
        continue;
      }

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
