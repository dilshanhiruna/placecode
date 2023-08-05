const path = require("path");
const fs = require("fs-extra");
const { spawnSync } = require("child_process");
const { core } = require("../src/placecode/index.js");
const { readConfigJson } = require("../src/placecode/index.js");
const usePrettier = require("../src/placecode/src/prettier.js");

// Helper function to calculate the total number of features in the placecode.json file
function calculateTotalFeatures(jsonData) {
  let totalFeatures = 0;
  for (const category of jsonData) {
    totalFeatures += category.features.length;
  }
  return totalFeatures;
}

// Helper function to clone a Git repository
function cloneRepo(repoUrl, destDir) {
  spawnSync("git", ["clone", repoUrl, destDir]);
}

// Helper function to move files from the template directory to the destination directory
function moveFiles(sourceDir, destDir) {
  // Remove the .git folder
  const gitDir = path.join(sourceDir, ".git");
  fs.removeSync(gitDir);

  // Remove placecode.json file
  const optionsFilePath = path.join(sourceDir, "placecode.json");
  fs.removeSync(optionsFilePath);

  // Remove the pc.config.json file
  const zpcDir = path.join(sourceDir, "pc.config.json");
  fs.removeSync(zpcDir);

  fs.readdirSync(sourceDir).forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);
    const sourceStats = fs.statSync(sourceFile);

    // Check if the source item is a directory
    if (sourceStats.isDirectory()) {
      const destSubDir = path.join(destDir, file);

      // Create the destination subdirectory if it doesn't exist
      if (!fs.existsSync(destSubDir)) {
        fs.mkdirSync(destSubDir);
      }

      // Move the files inside the source subdirectory to the destination subdirectory
      moveFiles(sourceFile, destSubDir);
    } else {
      if (!fs.existsSync(destFile)) {
        // Move the file to the destination directory
        fs.moveSync(sourceFile, destFile, { overwrite: true });
      }
    }
  });
}

async function gen(arg) {
  const templateDir = path.join(__dirname, "../templates");
  // clean the template directory
  fs.emptyDirSync(templateDir);

  let url = "";
  let featureNumbers = [];

  try {
    // Decode the argument
    const decodedArg = Buffer.from(arg, "base64").toString("utf-8");

    // Split the decoded argument at the question mark '?'
    const [urlPart, numbersPart] = decodedArg.split("?");
    if (!urlPart || !numbersPart) {
      console.log(
        "Invalid argument format. Expected URL and numbers separated by '?'"
      );
      return;
    }

    // Extract the URL and trim whitespace
    url = urlPart.trim();

    // Extract and validate the feature numbers
    featureNumbers = numbersPart
      .split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num));

    // Check for any non-numeric feature numbers
    if (featureNumbers.length !== numbersPart.split(",").length) {
      console.log(
        "Invalid feature numbers. All feature numbers should be integers."
      );
      return;
    }
  } catch (error) {
    console.log("Error decoding the argument:", error);
    return;
  }

  // Clone the repository into the template directory
  cloneRepo(url, templateDir);

  // Check if placecode.json file exists
  const optionsFilePath = path.join(templateDir, "placecode.json");
  if (!fs.existsSync(optionsFilePath)) {
    console.log("No placecode.json file found");
    return;
  }

  let options = {};

  try {
    const optionsData = fs.readFileSync(optionsFilePath, "utf-8");
    options = JSON.parse(optionsData);
  } catch (error) {
    console.log("Error reading placecode.json:", error);
    return;
  }

  // Validate the feature numbers
  const maxFeatureNumber = calculateTotalFeatures(options);
  const invalidFeatureNumbers = featureNumbers.filter(
    (num) => num < 1 || num > maxFeatureNumber
  );
  if (invalidFeatureNumbers.length > 0) {
    console.log(
      "Invalid feature numbers. Feature numbers should be between 1 and",
      maxFeatureNumber
    );
    return;
  }

  let featureIndex = 1; // Initialize the feature index
  const enabledFeatureLabels = []; // Array to store labels of enabled features
  // Update the enabled values in placecode.json
  for (const category of options) {
    for (const feature of category.features) {
      const featureNumber = featureIndex;
      feature.enabled = featureNumbers.includes(featureNumber);
      if (feature.enabled) {
        enabledFeatureLabels.push(feature.label);
      }
      featureIndex++; // Increment the feature index
    }
  }

  // Save the updated placecode.json file
  try {
    fs.writeFileSync(optionsFilePath, JSON.stringify(options, null, 2));
  } catch (error) {
    console.log("Error writing placecode.json:", error);
    return;
  }

  // Run the placecode process
  try {
    core("remove", templateDir);

    moveFiles(templateDir, process.cwd());

    // run prettier
    const { ignore } = readConfigJson(process.cwd());
    await usePrettier(process.cwd(), ignore);

    console.log("Features: ", enabledFeatureLabels.join(", "));
    console.log("\x1b[32m%s\x1b[0m", "Template generation complete!");
  } catch (error) {
    console.log("Template generation failed.");
    process.exit(1); // Error occurred during execution
  }
}

module.exports = gen;
