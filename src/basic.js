const { core } = require("./placecode");

async function runCmd(cmd) {
  try {
    await core(cmd);
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

module.exports = runCmd;
