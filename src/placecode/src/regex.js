// used in generateTemplate, processPlacecodeFiles
// `// pc:begin:.*${option}.*[\\s\\S]*?// pc:end:.*${option}\\s*`,
// `// pc:begin:.*${option}.*[\\s\\S]*?// pc:end:.*${option}.*(?:\r?\n|$)`;
const regex_start_to_end_options = (option) =>
  `\\/\\/ pc:begin:.*?${option}\\b[\\s\\S]*?\\/\\/ pc:end:.*?${option}\\b(?:\\r?\\n|$)`;

// start marker
const regex_start_marker = /pc:begin:\s*([^/\n\r]*)/;

const regex_start_string_marker = "// pc:begin:";

const regex_end_string_marker = "// pc:end:";

const regex_depend_string_marker = "// pc:depend:";

// depends marker
const regex_depends_marker = /pc:depend:\s*([^/\n\r]*)/;

// reuse marker
const regex_reuse_marker = /\/\/ pc:reuse: (.+)/g;

//depends with options
const regex_depends_with_options = (dependsOnOptions) =>
  `// pc:depend:\\s*${dependsOnOptions.join("\\s*,\\s*")}\\s*`;

// all markers
const regex_all_markers = /\/\/ pc:(begin|end|depend)[^\r\n]*\r?\n/g;

// start only marker
const regex_start_only_marker = /\/\/ pc:begin:/g;

// end only marker
const regex_end_only_marker = /\/\/ pc:end/g;

// how all markers start
const regex_all_markers_start = "//";

// file ignore regex
const regex_file_ignore =
  /\/\*\s*pc:\s*ignorefile\s*|\s*pc:\s*ignorefile\s*\*\//g;

// lines starting with "// pc:" or "pc:"
const regex_pc_lines = /^(\s*\/\/\s*pc:)|^(\s*pc:)/;

// lines starting with "// pc:"
const regex_pc_lines_start = /^(\s*\/\/|pc:)/;

// for formatting
const fmt_start_regex = /\/\/\s*pc\s*:\s*begin:([^]+?)\n/g;
const fmt_depends_regex = /\/\/\s*pc\s*:\s*depend:([^]+?)\n/g;
const fmt_end_regex = /\/\/\s*pc\s*:\s*end:([^]+?)\n/g;

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
  regex_pc_lines,
  regex_pc_lines_start,
  regex_start_string_marker,
  regex_end_string_marker,
  regex_depend_string_marker,
  fmt_start_regex,
  fmt_depends_regex,
  fmt_end_regex,
};
