# Placecode - Dynamic Template Generator

[![npm version](https://img.shields.io/npm/v/placecode.svg)](https://www.npmjs.com/package/placecode)
[![License](https://img.shields.io/github/license/dilshanhiruna/placecode.svg)](https://github.com/dilshanhiruna/placecode/blob/main/LICENSE)

## Table of Contents

- [Introduction](#introduction)
- [Problem](#problem)
- [Solution](#solution)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
- [Command Reference](#command-reference)
- [Documentation](#documentation)
- [Contribution](#contribution)
- [License](#license)

## Introduction

Placecode is a powerful npm CLI package that simplifies dynamic template creation for developers. It allows you to generate customizable templates with ease, tailoring them to your specific project needs.

## Problem

Starting a new coding project from scratch can be time-consuming and repetitive. Boilerplate code often hinders developers from focusing on the core functionality that matters. Pre-made starter projects or static boilerplates offer some convenience, but they lack the flexibility to cater to individual developers' preferences and project requirements.

## Solution

Placecode provides a unique solution to this problem by enabling developers to create dynamic templates effortlessly. With simple comment markers, you can annotate code blocks, files, and folders to specific features defined in the placecode.json file. These dynamic templates can then be shared on the [placecode.io](https://www.placecode.io), where other developers can select their preferred features and generate a project tailored to their requirements uisng the same placecode CLI.

## Features

- Command-line Interface (CLI) for local template generation.
- Dynamic template generation based on selected features.
- Intuitive comment markers for specifying code blocks and files related to specific features.
- Customizable placecode.json file for defining features and dependencies.
- Support for a wide range of web frameworks, libraries, and tools.

## Getting Started

Please ensure that you have Node.js (version 10 or higher) installed before proceeding with the installation.

To use Placecode, you need to install it globally via npm. Open your terminal and run:

```bash
npm install -g placecode
```

> **Warning**: Make sure to install Placecode globally to ensure proper functionality.

For more details on installation and troubleshooting, refer to the [Installation Guide](https://www.placecode.io/docs/command-reference/placecode-init).

## Command Reference

- **placecode init**: Initialize a Placecode project for dynamic template creation.
- **placecode run**: Execute the dynamic template based on the enabled features in placecode.json.
- **placecode re**: Revert the changes made by placecode run and restore the original project state.
- **placecode fmt**: Format comment markers in your placecode project for consistency.
- **placecode addzpc**: Add empty zpc.txt files to every directory for specifying files and folders associated with specific features.
- **placecode gen <template-code-from-placecode.io>**: Generate templates from existing dynamic templates from placecode.io.

For more details on each command and their usage, refer to the [Command Reference Guide](https://www.placecode.io/docs/getting-started/installation).

## Documentation

For comprehensive documentation on using Placecode, creating dynamic templates, configuration options, and more, please visit the [official documentation](https://www.placecode.io/docs).

## Contribution

We welcome and appreciate contributions from the community. Whether it's bug fixes, new features, or improvements to existing code, feel free to submit a pull request. Please refer to our [Contribution Guidelines](https://www.placecode.io/docs/contribution-guidelines) for more information.

## License

This project is licensed under the MIT License.
