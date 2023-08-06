const { core } = require("./placecode");

function runCmd(cmd) {
  try {
    core(cmd);
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

module.exports = runCmd;
