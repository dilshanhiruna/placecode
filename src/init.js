#!/usr/bin/env node

const path = require("path");
const { exec } = require("child_process");
const os = require("os");
const fs = require("fs-extra");
const { spawnSync } = require("child_process");

const folderName = "placecode";

const packageDir = path.join(__dirname, "..");
const sourceDir = path.join(packageDir, folderName);
const destDir = path.join(process.cwd(), `.${folderName}`);

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
    await copyDirectory(sourceDir, destDir);

    // Set hidden attribute for .placecode folder
    setHiddenAttribute(destDir);

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
