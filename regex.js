// used in generateTemplate, processPlacecodeFiles
// `// RA:START:.*${option}.*[\\s\\S]*?// RA:END:.*${option}\\s*`,
const regex_start_to_end_options = (option) =>
  `// RA:START:.*${option}.*[\\s\\S]*?// RA:END:.*${option}.*(?:\r?\n|$)`;

// start marker
const regex_start_marker = /RA:START:\s*([^/\n\r]*)/;

// depends marker
const regex_depends_marker = /RA:DEPENDS:\s*([^/\n\r]*)/;

//depends with options
const regex_depends_with_options = (dependsOnOptions) =>
  `// RA:DEPENDS:\\s*${dependsOnOptions.join("\\s*,\\s*")}\\s*`;

// all markers
const regex_all_markers = /\/\/ RA:(START|END|DEPENDS)[^\r\n]*\r?\n/g;

// start only marker
const regex_start_only_marker = /\/\/ RA:START:/g;

// end only marker
const regex_end_only_marker = /\/\/ RA:END/g;

module.exports = {
  regex_start_to_end_options,
  regex_start_marker,
  regex_depends_marker,
  regex_depends_with_options,
  regex_all_markers,
  regex_start_only_marker,
  regex_end_only_marker,
};
