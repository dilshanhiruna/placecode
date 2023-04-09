#!/usr/bin/env node

const { program } = require("commander");
const initPlacecode = require("../src/init");

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
    console.log(`Running the project with argument: ${arg}`);
  });

program.parse(process.argv);
