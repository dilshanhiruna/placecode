console.log("this is a default code line");

// RA:START: option1
console.log("this is a code line for option 1");
// RA:END: option1

// RA:START: option1
console.log("this is a code line for option 1");
// RA:END: option1

// RA:START: option2, option5
console.log("this is a code line for option 2 and option 5");
// RA:END: option2, option5

// RA:START: option6
console.log("this is a code line for option6, depends on option7, option8");

// RA:START: option2
console.log("this is a code line for option6");
// RA:DEPENDS: option3, option4
// RA:END: option2

// RA:DEPENDS: option2, option8
// RA:END: option6

// RA:START: option1
console.log("this is a code line for option 1");
// RA:END: option1
