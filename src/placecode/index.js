const checkCommentMarkers = require("./src/checker");
const processPlacecodeFiles = require("./src/forfiles");
const generateTemplate = require("./src/forcontent");
const blockComments = require("./src/blockcomments");
const blockFiles = require("./src/blockfiles");
const blockReset = require("./src/blockreset");
const runValidations = require("./src/validations");
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

async function core(cmd, dir) {
  const sourceDir = dir ? dir : process.cwd();

  const options = readPlacecodeJson(sourceDir);

  const { ignore } = readConfigJson(sourceDir);

  // ignore without zpc.txt
  const ignorewozpc = ignore.filter((item) => item !== "zpc.txt");

  const selectedOptions = convertJsonOptions(options);

  if (cmd === "re") {
    blockReset(sourceDir, selectedOptions, ignore);
  }

  if (cmd === "zpc") {
    const createdCount = addZpcFiles(sourceDir, ignore);
    console.log(`Total zpc.txt files created: ${createdCount}`);
  }

  if (cmd === "zpc-rm") {
    const deletedCount = deleteEmptyZpcFiles(sourceDir, ignore);
    console.log(`Total zpc.txt files deleted: ${deletedCount}`);
  }

  if (cmd === "fmt") {
    formatCommentMarkers(sourceDir, ignorewozpc);
  }

  if (cmd === "run") {
    if (!checkCommentMarkers(sourceDir, ignorewozpc)) {
      // show running features
      console.log(
        "Running features: " +
          Object.entries(selectedOptions)
            .filter(([key, value]) => value)
            .map(([key]) => key)
            .join(", ")
      );

      const results = runValidations(sourceDir);

      if (!results.isValid) {
        console.error(
          "\x1b[33m%s\x1b[0m",
          `\nplacecode.json validation failed:`
        );
        console.log(results.errorMessage);
        process.exit(1); // Exit the process with an error code
      }

      blockReset(sourceDir, selectedOptions, ignore);
      blockFiles(sourceDir, selectedOptions, ignore);
      blockComments(sourceDir, selectedOptions, ignore);
    }
  }

  if (cmd === "validate") {
    if (!checkCommentMarkers(sourceDir, ignorewozpc)) {
      const results = runValidations(sourceDir);

      if (!results.isValid) {
        console.error("\x1b[33m%s\x1b[0m", `Validation failed:`);
        console.log(results.errorMessage);
        process.exit(1); // Exit the process with an error code
      }

      console.log("\x1b[32m%s\x1b[0m", "Validation passed.");
    }
  }

  if (cmd === "remove") {
    if (!checkCommentMarkers(sourceDir, ignorewozpc)) {
      await processPlacecodeFiles(sourceDir, selectedOptions, ignore);
      generateTemplate(sourceDir, selectedOptions, ignore);
    }
  }
}

module.exports = {
  core,
  readConfigJson,
};
