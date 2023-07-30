#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");
const initPlacecode = require("../src/init");
const gen = require("placecode/src/gen");
const { run, resetOnly, addzpc, fmt } = require("placecode/src/basic");

program
  .version(packageJson.version)
  .command("init")
  .description("Initialize the project")
  .action(() => {
    initPlacecode();
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
    run();
  });

program
  .command("re")
  .description("Reset the project without running it")
  .action(() => {
    resetOnly();
  });

program
  .command("addzpc")
  .description("Add empty zpc files to every folder")
  .action(() => {
    addzpc();
  });

program
  .command("fmt")
  .description("Format the comment markers")
  .action(() => {
    fmt();
  });

program.parse(process.argv);
