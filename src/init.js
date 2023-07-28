#!/usr/bin/env node

const path = require("path");
const { exec } = require("child_process");
const os = require("os");
const { spawnSync } = require("child_process");
const fs = require("fs-extra");

const folderName = ".placecode";
const pcFileName = "placecode.json";

const packageDir = path.join(__dirname, "..");
const sourceDir = path.join(packageDir, folderName);
const destDir = path.join(process.cwd(), `${folderName}`);

const pcFile = path.join(packageDir, pcFileName);
const destpcFile = path.join(process.cwd(), `${pcFileName}`);

function copyDirectoryOrFile(source, destination) {
  return new Promise((resolve, reject) => {
    fs.stat(source, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats.isDirectory()) {
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
      } else if (stats.isFile()) {
        fs.copy(source, destination, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error("Source is neither a directory nor a file."));
      }
    });
  });
}

function setHiddenAttribute(path) {
  const command = `attrib +h "${path}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error setting hidden attribute:", error);
    }
  });
}

async function initPlacecode() {
  try {
    await copyDirectoryOrFile(sourceDir, destDir);

    await copyDirectoryOrFile(pcFile, destpcFile);

    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

    const child = spawnSync(npmCmd, ["i", "fs-extra"], {
      cwd: process.cwd(),
      stdio: "inherit",
    });

    if (child.error) {
      console.error(child.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error copying folder:", error);
  }
}

module.exports = initPlacecode;
