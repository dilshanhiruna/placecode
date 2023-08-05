const { core } = require("./placecode");

function resetOnly(cmd) {
  try {
    core(cmd);
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

function run(cmd) {
  try {
    core(cmd);
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

function addzpc(cmd) {
  try {
    core(cmd);
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

function fmt(cmd) {
  try {
    core(cmd);
    process.exit(0); // Successful execution
  } catch (error) {
    console.error(error);
    process.exit(1); // Error occurred during execution
  }
}

module.exports = {
  run,
  resetOnly,
  addzpc,
  fmt,
};
