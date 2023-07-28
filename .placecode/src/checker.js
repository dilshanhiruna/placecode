const fs = require("fs-extra");
const path = require("path");
const { regex_start_only_marker, regex_end_only_marker } = require("./regex");
const { ignore } = require("../config.json");

function checkCommentMarkers(dir) {
  const files = fs.readdirSync(dir);
  let errorFound = false;
  for (const file of files) {
    // check if the directory is in the ignore list
    if (ignore.includes(file)) {
      continue;
    }
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

module.exports = checkCommentMarkers;
