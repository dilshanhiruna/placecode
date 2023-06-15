#!/usr/bin/env node

const { program } = require("commander");
const initPlacecode = require("../src/init");
const get = require("placecode/src/get");
const { run, resetOnly, remove } = require("placecode/src/basic");

program
  .command("init")
  .description("Initialize the project")
  .action(() => {
    initPlacecode();
  });

program
  .command("get <arg>")
  .description("Get the project with the specified argument")
  .action((arg) => {
    get(arg);
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
  .command("rm")
  .description("Remove the project")
  .action(() => {
    remove();
  });

program.parse(process.argv);
