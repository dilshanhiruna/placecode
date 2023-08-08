const process = require("process");

class Spinner {
  constructor() {
    this.frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    this.frameIndex = 0;
    this.loadingInterval = null;
    this.isRunning = false;
    this.text = "";
  }

  start(text) {
    if (!this.isRunning) {
      this.isRunning = true;
      this.text = text;
      this.loadingInterval = setInterval(() => {
        if (this.isRunning) {
          const frame = this.frames[this.frameIndex];
          process.stdout.clearLine(); // Clear the current line
          process.stdout.cursorTo(0); // Move the cursor to the beginning of the line
          process.stdout.write(
            `\x1b[32m${this.frames[this.frameIndex]}\x1b[0m ${this.text}`
          );
          this.frameIndex = (this.frameIndex + 1) % this.frames.length;
        }
      }, 80);
    }
  }

  stop() {
    if (this.isRunning) {
      clearInterval(this.loadingInterval);
      process.stdout.clearLine(); // Clear the current line
      process.stdout.cursorTo(0); // Move the cursor to the beginning of the line
      this.isRunning = false;
    }
  }

  changeText(text) {
    if (this.isRunning) {
      this.text = text;
      process.stdout.clearLine(); // Clear the current line
      process.stdout.cursorTo(0); // Move the cursor to the beginning of the line
      process.stdout.write(`${this.frames[this.frameIndex]} ${this.text}`);
    }
  }
}

module.exports = Spinner;
