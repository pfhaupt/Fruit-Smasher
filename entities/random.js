let weights = [200, 100, 80, 45, 27, 18, 11, 5, 2];
let total = sum(weights);

function sum(arr) {
  let s = 0;
  for (let i of arr) s += i;
  return s;
}
console.log(weights);

for (let i = 0; i < weights.length; i++) {
  weights[i] = total / weights[i];
}
console.log(weights);
total = sum(weights);

for (let i = 0; i < weights.length; i++) {
  weights[i] = weights[i] / total;
}

console.log(weights);

for (let i = 1; i < weights.length; i++) {
  weights[i] = weights[i] + weights[i - 1];
}
let counts = new Array(weights.length).fill(0);
let iter = 10_000_000;
for (let i = 0; i < iter; i++) {
  r = Math.random();
  for (let j = 0; j < weights.length; j++) {
    if (r < weights[j]) {
      counts[j]++;
      break;
    }
  }
}
console.log(counts);