#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");

const configFileName = "src/init/pc.config.json";
const pcFileName = "src/init/placecode.json";

const packageDir = path.join(__dirname, "..");

const configFile = path.join(packageDir, configFileName);
const destconfigFile = path.join(process.cwd(), "pc.config.json");

const pcFile = path.join(packageDir, pcFileName);
const destpcFile = path.join(process.cwd(), "placecode.json");

function copyFile(source, destination) {
  return new Promise((resolve, reject) => {
    fs.stat(source, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats.isFile()) {
        fs.copy(source, destination, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

async function init() {
  try {
    await copyFile(configFile, destconfigFile);

    await copyFile(pcFile, destpcFile);

    console.log("\x1b[32m%s\x1b[0m", "Placecode Project Initialized");
  } catch (error) {
    console.error("Error in Placecode Project Initialization:", error);
  }
}

module.exports = init;
