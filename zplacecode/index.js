const { sourceDir, destDir, production } = require("./config.json");
const checkCommentMarkers = require("./src/checker");
const processPlacecodeFiles = require("./src/forfiles");
const generateTemplate = require("./src/forcontent");
const fs = require("fs-extra");

function main() {
  if (production) {
    if (!checkCommentMarkers(sourceDir)) {
      processPlacecodeFiles(sourceDir);
      generateTemplate(sourceDir);
    }
  } else {
    if (!checkCommentMarkers(sourceDir)) {
      // make a copy of the source code
      fs.copySync(sourceDir, destDir);
      processPlacecodeFiles(destDir);
      generateTemplate(destDir);
    }
  }
}

main();
