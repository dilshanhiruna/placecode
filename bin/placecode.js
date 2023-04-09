#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const folderName = "output"; // Change this to the name of the folder you want to copy

const sourceFolder = path.join(process.cwd(), folderName);
const destFolder = path.join(process.cwd(), `${folderName}_copy`);

// Use the 'cp' command to copy the folder
exec(`cp -r ${sourceFolder} ${destFolder}`, (err, stdout, stderr) => {
  if (err) throw err;
  console.log(`Folder '${folderName}' copied to '${destFolder}'`);
});
