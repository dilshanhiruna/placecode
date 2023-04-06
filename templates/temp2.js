console.log("this is a default code line");
console.log("this is a default code line");

// RA:START: option1
console.log("this is a code line for option 1");
// RA:END: option1

console.log("this is a default code line");

// RA:START: option2, option9, option8
console.log("this is a code line for option 2");
// RA:END: option2, option9, option8

// RA:START: option3
console.log("this is a code line for option 3");

// RA:START: option4
console.log("this is a code line for option 4");
// RA:START: option1
console.log("this is a code line for option 4");
// RA:DEPENDS: option7, option8
// RA:END: option1
console.log("this is a code line for option 4");
console.log("this is a code line for option 4");
// RA:END: option4

// RA:END: option3

// RA:START: option1
console.log("this is a code line for option 1");
// RA:END: option1
