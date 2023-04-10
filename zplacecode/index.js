const { sourceDir, destDir, production } = require("./config.json");
const options = require("./options.json");
const checkCommentMarkers = require("./src/checker");
const processPlacecodeFiles = require("./src/forfiles");
const generateTemplate = require("./src/forcontent");
const fs = require("fs-extra");

function convertJsonOptions(input) {
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (value.enabled !== false) {
      output[key] = true;
    } else {
      output[key] = false;
    }
  }
  return output;
}

function main() {
  const selectedOptions = convertJsonOptions(options);

  if (production) {
    if (!checkCommentMarkers(sourceDir)) {
      processPlacecodeFiles(sourceDir, selectedOptions);
      generateTemplate(sourceDir, selectedOptions);
    }
  } else {
    if (!checkCommentMarkers(sourceDir)) {
      // make a copy of the source code
      fs.copySync(sourceDir, destDir);
      processPlacecodeFiles(destDir, selectedOptions);
      generateTemplate(destDir, selectedOptions);
    }
  }
}

main();
