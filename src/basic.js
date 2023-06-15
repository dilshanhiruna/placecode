const { execSync } = require("child_process");

function resetOnly() {
  try {
    execSync("node placecode resetonly", { stdio: "inherit" });
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

function run() {
  try {
    execSync("node placecode", { stdio: "inherit" });
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

function remove() {
  try {
    execSync("node placecode remove", { stdio: "inherit" });
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

module.exports = {
  run,
  resetOnly,
  remove,
};
