const { sourceDir } = require("./config.json");
const options = require("./options.json");
const checkCommentMarkers = require("./src/checker");
const processPlacecodeFiles = require("./src/forfiles");
const generateTemplate = require("./src/forcontent");
const blockComments = require("./src/blockcomments");
const blockFiles = require("./src/blockfiles");
const blockReset = require("./src/blockreset");

function convertJsonOptions(input) {
  const output = {};
  for (const [category, categoryData] of Object.entries(input)) {
    const features = categoryData.features || {};
    for (const [option, optionData] of Object.entries(features)) {
      if (optionData.enabled !== false) {
        output[option] = true;
      } else {
        output[option] = false;
      }
    }
  }
  return output;
}

function main() {
  const selectedOptions = convertJsonOptions(options);

  const resetOnly = process.argv.includes("resetonly");
  const remove = process.argv.includes("remove");

  if (resetOnly) {
    blockReset(sourceDir, selectedOptions);
  } else if (remove) {
    if (!checkCommentMarkers(sourceDir)) {
      processPlacecodeFiles(sourceDir, selectedOptions);
      generateTemplate(sourceDir, selectedOptions);
    }
  } else {
    blockReset(sourceDir, selectedOptions);
    blockFiles(sourceDir, selectedOptions);
    blockComments(sourceDir, selectedOptions);
  }
}

main();