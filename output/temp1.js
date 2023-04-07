console.log("this is a default code line");

console.log("this is a default code line");

function fibonacci(n) {
  if (n === 0 || n === 1) {
    return n;
  }

  let fib1 = 0;
  let fib2 = 1;
  let fibN = 1;

  for (let i = 2; i <= n; i++) {
    fibN = fib1 + fib2;
    fib1 = fib2;
    fib2 = fibN;
  }

  return fibN;
}

console.log("this is a code line for option 1");

console.log("this is a code line for option 1");

console.log("this is a code line for option 2 and option 5");

//--------------------------------------------------------------

console.log("this is a code line for option6, depends on option7, option8");

console.log("this is a code line for option6");

//--------------------------------------------------------------

console.log("this is a code line for option 1");
