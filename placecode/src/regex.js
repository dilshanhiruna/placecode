// used in generateTemplate, processPlacecodeFiles
// `// ZPC:START:.*${option}.*[\\s\\S]*?// ZPC:END:.*${option}\\s*`,
const regex_start_to_end_options = (option) =>
  `// ZPC:START:.*${option}.*[\\s\\S]*?// ZPC:END:.*${option}.*(?:\r?\n|$)`;

// start marker
const regex_start_marker = /ZPC:START:\s*([^/\n\r]*)/;

const regex_start_string_marker = "// ZPC:START:";

const regex_end_string_marker = "// ZPC:END:";

const regex_depend_string_marker = "// ZPC:DEPENDS:";

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

// file ignore regex
const regex_file_ignore =
  /\/\*\s*ZPC:\s*IGNOREFILE\s*|\s*ZPC:\s*IGNOREFILE\s*\*\//g;

// lines starting with "// ZPC:" or "ZPC:"
const regex_zpc_lines = /^(\s*\/\/\s*ZPC:)|^(\s*ZPC:)/;

// lines starting with "// ZPC:"
const regex_zpc_lines_start = /^(\s*\/\/|ZPC:)/;

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
  regex_file_ignore,
  regex_zpc_lines,
  regex_zpc_lines_start,
  regex_start_string_marker,
  regex_end_string_marker,
  regex_depend_string_marker,
};
