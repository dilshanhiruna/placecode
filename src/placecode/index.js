const checkCommentMarkers = require("./src/checker");
const processPlacecodeFiles = require("./src/forfiles");
const generateTemplate = require("./src/forcontent");
const blockComments = require("./src/blockcomments");
const blockFiles = require("./src/blockfiles");
const blockReset = require("./src/blockreset");
const { addZpcFiles, deleteEmptyZpcFiles } = require("./src/zpcfiles");
const formatCommentMarkers = require("./src/formatter");
const defaultIgnore = require("./src/ignoreList");
const fs = require("fs");
const path = require("path");

function readPlacecodeJson(dir) {
  const placecodeJsonFile = path.join(dir, ".", "placecode.json");
  if (fs.existsSync(placecodeJsonFile)) {
    const content = fs.readFileSync(placecodeJsonFile, "utf8");
    return JSON.parse(content);
  } else {
    console.error(
      "\x1b[33m%s\x1b[0m",
      "placecode.json file not found in the root directory."
    );
    process.exit(1); // Exit the process with an error code
  }
}

function readConfigJson(dir) {
  const configJsonFile = path.join(dir, ".", "pc.config.json");
  if (fs.existsSync(configJsonFile)) {
    const content = fs.readFileSync(configJsonFile, "utf8");

    // add the default ignore list to the ignore list in pc.config.json, avoiding duplicates
    const config = JSON.parse(content);
    if (config.ignore) {
      config.ignore = [...new Set([...config.ignore, ...defaultIgnore])];
    } else {
      config.ignore = defaultIgnore;
    }

    return config;
  } else {
    return { ignore: defaultIgnore };
  }
}

function convertJsonOptions(input) {
  const output = {};
  for (const category of input) {
    for (const feature of category.features) {
      output[feature.label] = feature.enabled;
    }
  }
  return output;
}

function core(cmd, dir) {
  const sourceDir = dir ? dir : process.cwd();

  const options = readPlacecodeJson(sourceDir);

  const { ignore } = readConfigJson(sourceDir);

  const selectedOptions = convertJsonOptions(options);

  if (cmd === "re") {
    const deletedCount = deleteEmptyZpcFiles(sourceDir, ignore);

    blockReset(sourceDir, selectedOptions, ignore);
  }

  if (cmd === "addzpc") {
    const createdCount = addZpcFiles(sourceDir, ignore);
    console.log(`Total zpc.txt files created: ${createdCount}`);
  }

  if (cmd === "fmt") {
    formatCommentMarkers(sourceDir, ignore);
  }

  if (cmd === "run") {
    const deletedCount = deleteEmptyZpcFiles(sourceDir, ignore);

    blockReset(sourceDir, selectedOptions, ignore);
    blockFiles(sourceDir, selectedOptions, ignore);
    blockComments(sourceDir, selectedOptions, ignore);
  }

  if (cmd === "remove") {
    if (!checkCommentMarkers(sourceDir, ignore)) {
      processPlacecodeFiles(sourceDir, selectedOptions, ignore);
      generateTemplate(sourceDir, selectedOptions, ignore);
    }
  }
}

module.exports = core;
