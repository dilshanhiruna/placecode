const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs-extra");
const { spawnSync } = require("child_process");

const serviceAccount = require("./path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
});

const db = admin.firestore();

// Helper function to clone a Git repository
function cloneRepo(repoUrl, destDir) {
  spawnSync("git", ["clone", repoUrl, destDir]);
}

// Helper function to move files from the template directory to the destination directory
function moveFiles(sourceDir, destDir) {
  fs.readdirSync(sourceDir).forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);
    fs.moveSync(sourceFile, destFile);
  });
}

async function run() {
  const { destDir, options, repo } = {
    destDir: "D:Personal Projectsplacecode-test",
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
  const templateDir = path.join(__dirname, "templates", "repo");
  cloneRepo(repo, templateDir);

  // Update the placecode config file options
  const configFilePath = path.join(templateDir, "config.json");
  const configFile = fs.readJsonSync(configFilePath);
  configFile.options = options;
  fs.writeJsonSync(configFilePath, configFile);

  // Run the placecode process
  const child = spawnSync("npm", ["start"], {
    cwd: path.join(__dirname, "zplacecode"),
    stdio: "inherit",
  });

  if (child.error) {
    console.error(child.error);
    process.exit(1);
  }

  // Move the generated files to the destination directory
  moveFiles(templateDir, destDir);

  console.log("Template generation complete!");
}
