const path = require("path");
const fs = require("fs-extra");
const { spawnSync } = require("child_process");

// Helper function to clone a Git repository
function cloneRepo(repoUrl, destDir) {
  spawnSync("git", ["clone", repoUrl, destDir]);
}

// Helper function to move files from the template directory to the destination directory
function moveFiles(sourceDir, destDir) {
  // Remove the .git folder
  const gitDir = path.join(sourceDir, ".git");
  fs.removeSync(gitDir);

  // remove zplacecode folder
  const zpcDir = path.join(sourceDir, "zplacecode");
  fs.removeSync(zpcDir);

  fs.readdirSync(sourceDir).forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);
    fs.moveSync(sourceFile, destFile);
  });
}

async function run() {
  const { options, repo } = {
    options: {
      option1: {
        enabled: true,
      },
      option2: {
        enabled: true,
      },
      option3: {
        enabled: false,
      },
      option4: {
        enabled: true,
      },
      option5: {
        enabled: true,
      },
      option6: {
        enabled: true,
      },
      option7: {
        enabled: true,
      },
      option8: {
        enabled: true,
      },
      option9: {
        enabled: true,
      },
    },
    repo: "https://github.com/dilshanhiruna/placecode",
  };

  const templateDir = path.join(__dirname, "../templates");
  // clean the template directory
  fs.emptyDirSync(templateDir);
  // Clone the repository into the template directory
  cloneRepo(repo, templateDir);

  // Update the placecode config file
  const configFilePath = path.join(templateDir, "zplacecode/config.json");
  const configFile = fs.readJsonSync(configFilePath);
  configFile.production = true;
  fs.writeJsonSync(configFilePath, configFile);

  //update the placecode options file
  const optionsFilePath = path.join(templateDir, "zplacecode/options.json");
  fs.writeFileSync(optionsFilePath, JSON.stringify(options, null, 2));

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

  // Run the placecode process
  const child = spawnSync(npmCmd, ["run", "zpc"], {
    cwd: path.join(__dirname, "..", "templates"),
    stdio: "inherit",
  });

  if (child.status === 0) {
    moveFiles(templateDir, process.cwd());
    console.log("Template generation complete!");
  } else {
    console.log("Template generation failed.");
  }
}

module.exports = run;
