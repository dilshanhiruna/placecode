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
  .action(() => {
    init();
  });

program
  .command("gen <arg>")
  .description("Generate the project with the specified argument")
  .action((arg) => {
    gen(arg);
  });

program
  .command("run")
  .description("Run the project")
  .action(() => {
    runCmd("run");
  });

program
  .command("re")
  .description("Reset the project without running it")
  .action(() => {
    runCmd("re");
  });

program
  .command("addzpc")
  .description("Add empty zpc files to every folder")
  .action(() => {
    runCmd("addzpc");
  });

program
  .command("fmt")
  .description("Format the comment markers")
  .action(() => {
    runCmd("fmt");
  });

program
  .command("validate")
  .description("Validate the placecode.json file")
  .action(() => {
    runCmd("validate");
  });

program.parse(process.argv);
