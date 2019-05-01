export function gcd(numbers) {
    return numbers.reduce((current, state) => gcdTwoNumbers(current, state));
}

export function lcm(numbers) {
    return numbers.reduce((current, state) => current * state) / gcd(numbers);
}

function gcdTwoNumbers(a, b) {
    while (b > 1E-10) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}