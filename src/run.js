const path = require("path");
const fs = require("fs-extra");
const os = require("os");
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

  fs.readdirSync(sourceDir).forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);
    fs.moveSync(sourceFile, destFile);
  });
}

async function run() {
  const { destDir, options, repo } = {
    destDir: "D:\\Personal Projects\\placecode-test",
    options: {
      option1: true,
      option2: true,
      option3: true,
      option4: true,
      option5: true,
      option6: true,
      option7: true,
      option8: true,
      option9: true,
    },
    repo: "https://github.com/dilshanhiruna/placecode",
  };

  // Clone the repository into the template directory
  const templateDir = path.join(__dirname, "../templates");
  cloneRepo(repo, templateDir);

  // Update the placecode config file options
  const configFilePath = path.join(templateDir, "zplacecode/config.json");
  const configFile = fs.readJsonSync(configFilePath);
  configFile.selectedOptions = options;
  configFile.production = true;
  fs.writeJsonSync(configFilePath, configFile);

  if (os.platform() === "win32") {
    // Run the placecode process
    const child = spawnSync("npm.cmd", ["run", "zpc"], {
      cwd: path.join(__dirname, "..", "templates"),
      stdio: "inherit",
    });

    if (child.error) {
      console.error(child.error);
      process.exit(1);
    } else {
      // Move the generated files to the destination directory
      moveFiles(templateDir, destDir);

      console.log("Template generation complete!");
    }
  } else {
    const child = spawnSync("npm", ["run", "zpc"], {
      cwd: path.join(__dirname, "..", "templates"),
      stdio: "inherit",
    });

    if (child.error) {
      console.error(child.error);
      process.exit(1);
    } else {
      // Move the generated files to the destination directory
      moveFiles(templateDir, destDir);

      console.log("Template generation complete!");
    }
  }
}

module.exports = run;
