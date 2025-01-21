const sum = (a: number, b: number) => a + b;
const sub = (a: number, b: number) => a - b;
const mul = (a: number, b: number) => a * b;
const div = (a: number, b: number) => a / b;

export const calcurator = (a: number, b: number, operator: string) => {
  switch (operator) {
    case '+':
      return sum(a, b);
    case '-':
      return sub(a, b);
    case '*':
      return mul(a, b);
    case '/':
      return div(a, b);
  }
};
