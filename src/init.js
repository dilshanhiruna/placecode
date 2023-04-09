const path = require("path");
const { exec } = require("child_process");
const os = require("os");
const fs = require("fs-extra");

const folderName = "zplacecode"; // Change this to the name of the folder you want to copy

const packageFolder = path.join(__dirname, "..");
const sourceFolder = path.join(packageFolder, folderName);
const destFolder = path.join(process.cwd(), `${folderName}_copy`);

function copyDirectory(source, destination) {
  return new Promise((resolve, reject) => {
    let command;
    if (os.platform() === "win32") {
      command = `xcopy "${source}" "${destination}" /E /I /Y`;
    } else {
      command = `cp -r "${source}" "${destination}"`;
    }
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function initPlacecode() {
  try {
    await copyDirectory(sourceFolder, destFolder);
    console.log(`Folder '${folderName}' copied to '${destFolder}'`);
  } catch (error) {
    console.error("Error copying folder:", error);
  }
}

module.exports = initPlacecode;
