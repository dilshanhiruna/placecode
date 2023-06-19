#!/usr/bin/env node

const { program } = require("commander");
const initPlacecode = require("../src/init");
const get = require("placecode/src/get");
const { run, resetOnly, addzpc, fmt } = require("placecode/src/basic");

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
