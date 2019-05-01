import {gcd, lcm} from './utils.js'

test('gcd', () => {
    expect(gcd([0.25, 0.5])).toBe(0.25);
    expect(gcd([0.5, 0.75])).toBe(0.25);
    expect(gcd([3, 5])).toBe(1);
    expect(gcd([12, 225])).toBe(3);
    expect(gcd([30, 36, 24])).toBe(6);
});

test('lcm', () => {
    expect(lcm([0.25, 0.5])).toBe(0.5);
    expect(lcm([0.5, 0.75])).toBe(1.5);
    expect(lcm([3, 5])).toBe(15);
    expect(lcm([12, 225])).toBe(900);
});