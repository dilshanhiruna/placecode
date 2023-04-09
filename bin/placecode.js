#!/usr/bin/env node

const { program } = require("commander");
const initPlacecode = require("../src/init");
const run = require("../src/run");

program
  .command("init")
  .description("Initialize the project")
  .action(() => {
    initPlacecode();
  });

program
  .command("run <arg>")
  .description("Run the project with the specified argument")
  .action((arg) => {
    run();
  });

program.parse(process.argv);
