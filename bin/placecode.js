#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");
const init = require("../src/init");
const gen = require("../src/gen");
const runCmd = require("../src/basic");

program
  .version(packageJson.version)
  .command("init")
  .description("Initialize the project")
  .action(async () => {
    await init();
  });

program
  .command("gen <arg>")
  .description("Generate the project with the specified argument")
  .action(async (arg) => {
    await gen(arg);
  });

program
  .command("run")
  .description("Run the project")
  .action(async () => {
    await runCmd("run");
  });

program
  .command("re")
  .description("Reset the project without running it")
  .action(async () => {
    await runCmd("re");
  });

program
  .command("zpc")
  .description(
    "Add empty zpc files to every folder or remove them with -rm flag"
  )
  .option("-rm, --remove", "Remove empty zpc files")
  .action(async (options) => {
    if (options.remove) {
      await runCmd("zpc-rm");
    } else {
      await runCmd("zpc");
    }
  });

program
  .command("fmt")
  .description("Format the comment markers")
  .action(async () => {
    await runCmd("fmt");
  });

program
  .command("validate")
  .description("Validate the placecode.json file")
  .action(async () => {
    await runCmd("validate");
  });

program.parse(process.argv);
