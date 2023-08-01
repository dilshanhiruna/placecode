#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");
const init = require("../src/init");
const gen = require("../src/gen");
const { run, resetOnly, addzpc, fmt } = require("../src/basic");

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
    run("run");
  });

program
  .command("re")
  .description("Reset the project without running it")
  .action(() => {
    resetOnly("re");
  });

program
  .command("addzpc")
  .description("Add empty zpc files to every folder")
  .action(() => {
    addzpc("addzpc");
  });

program
  .command("fmt")
  .description("Format the comment markers")
  .action(() => {
    fmt("fmt");
  });

program.parse(process.argv);
