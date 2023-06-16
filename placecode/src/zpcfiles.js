const fs = require("fs-extra");
const path = require("path");

function addZpcFiles(directory) {
  let createdCount = 0;
  try {
    const files = fs.readdirSync(directory);

    // Check if the directory already contains a zpc.txt file
    if (!files.includes("zpc.txt")) {
      const zpcFilePath = path.join(directory, "zpc.txt");
      fs.writeFileSync(zpcFilePath, "");
      createdCount++;
    }

    for (const file of files) {
      const filePath = path.join(directory, file);

      if (fs.statSync(filePath).isDirectory()) {
        // Recursively add zpc.txt files to subdirectories
        // Recursively add zpc.txt files to subdirectories
        const subdirectoryCreatedCount = addZpcFiles(filePath);
        createdCount += subdirectoryCreatedCount;
      }
    }
  } catch (error) {
    console.error(`Error adding zpc.txt files: ${error}`);
  }
  return createdCount;
}

function deleteEmptyZpcFiles(directory) {
  let deletedCount = 0;
  try {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);

      if (fs.statSync(filePath).isDirectory()) {
        // Recursively check and delete empty zpc.txt files in subdirectories
        const subdirectoryDeletedCount = deleteEmptyZpcFiles(filePath);
        deletedCount += subdirectoryDeletedCount;
      } else if (file === "zpc.txt") {
        const fileContent = fs.readFileSync(filePath, "utf8");

        if (fileContent.trim() === "") {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error deleting empty zpc.txt files: ${error}`);
  }
  return deletedCount;
}

module.exports = {
  addZpcFiles,
  deleteEmptyZpcFiles,
};
