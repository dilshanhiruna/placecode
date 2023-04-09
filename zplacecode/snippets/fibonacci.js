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
