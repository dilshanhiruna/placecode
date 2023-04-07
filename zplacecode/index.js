const fs = require("fs-extra");

const { sourceDir, destDir } = require("./zpc.config.js");
const checkCommentMarkers = require("./src/checker");
const processPlacecodeFiles = require("./src/forfiles");
const generateTemplate = require("./src/forcontent");

function main() {
  if (!checkCommentMarkers(sourceDir)) {
    // make a copy of the source code
    fs.copySync(sourceDir, destDir);
    processPlacecodeFiles(destDir);
    generateTemplate(destDir);
  }
}

main();
