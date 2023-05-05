// used in generateTemplate, processPlacecodeFiles
// `// ZPC:START:.*${option}.*[\\s\\S]*?// ZPC:END:.*${option}\\s*`,
const regex_start_to_end_options = (option) =>
  `// ZPC:START:.*${option}.*[\\s\\S]*?// ZPC:END:.*${option}.*(?:\r?\n|$)`;

// start marker
const regex_start_marker = /ZPC:START:\s*([^/\n\r]*)/;

// depends marker
const regex_depends_marker = /ZPC:DEPENDS:\s*([^/\n\r]*)/;

// reuse marker
const regex_reuse_marker = /\/\/ ZPC:REUSE: (.+)/g;

//depends with options
const regex_depends_with_options = (dependsOnOptions) =>
  `// ZPC:DEPENDS:\\s*${dependsOnOptions.join("\\s*,\\s*")}\\s*`;

// all markers
const regex_all_markers = /\/\/ ZPC:(START|END|DEPENDS)[^\r\n]*\r?\n/g;

// start only marker
const regex_start_only_marker = /\/\/ ZPC:START:/g;

// end only marker
const regex_end_only_marker = /\/\/ ZPC:END/g;

// how all markers start
const regex_all_markers_start = "//";

module.exports = {
  regex_start_to_end_options,
  regex_start_marker,
  regex_depends_marker,
  regex_depends_with_options,
  regex_all_markers,
  regex_start_only_marker,
  regex_end_only_marker,
  regex_all_markers_start,
  regex_reuse_marker,
};
