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

  // remove placecode folder
  const zpcDir = path.join(sourceDir, "placecode");
  fs.removeSync(zpcDir);

  fs.readdirSync(sourceDir).forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);
    fs.moveSync(sourceFile, destFile);
  });
}

async function get(arg) {
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

  //update the placecode options file
  const optionsFilePath = path.join(templateDir, "placecode/options.json");
  fs.writeFileSync(optionsFilePath, JSON.stringify(options, null, 2));

  // Run the placecode process
  const child = spawnSync("node", ["placecode", "remove"], {
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

module.exports = get;
