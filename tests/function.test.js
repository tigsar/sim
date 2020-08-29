import * as Function from './blocks/function.js'

function evaluate(block, value) {
    return block.output({
        [Function.input]: value
    })[Function.output];
}

test('gain function block', () => {
    let gain = new Function.Block(x => 10 * x);
    expect(evaluate(gain, 1)).toBe(10);
    expect(evaluate(gain, 2)).toBe(20);
    expect(evaluate(gain, 10)).toBe(100);
    expect(evaluate(gain, 0.1)).toBe(1);
    expect(evaluate(gain, 0.5)).toBe(5);

    gain = new Function.Block(x => 0.5 * x);
    expect(evaluate(gain, 1)).toBe(0.5);
    expect(evaluate(gain, 2)).toBe(1);
    expect(evaluate(gain, 10)).toBe(5);
    expect(evaluate(gain, 0.1)).toBe(0.05);
    expect(evaluate(gain, 0.5)).toBe(0.25);
});

test('absolute value function block', () => {
    let abs = new Function.Block(x => Math.abs(x));
    expect(evaluate(abs, 1)).toBe(1);
    expect(evaluate(abs, 0)).toBe(0);
    expect(evaluate(abs, 0.1)).toBe(0.1);
    expect(evaluate(abs, -0.1)).toBe(0.1);
    expect(evaluate(abs, 1000)).toBe(1000);
    expect(evaluate(abs, -123)).toBe(123);
    expect(evaluate(abs, -1923.1202)).toBe(1923.1202);
    expect(evaluate(abs, 1.53)).toBe(1.53);
});

test('sinus value function block', () => {
    let sin = new Function.Block(x => Math.sin(x));
    expect(evaluate(sin, 0)).toBeCloseTo(0);
    expect(evaluate(sin, Math.PI / 2.0)).toBeCloseTo(1);
    expect(evaluate(sin, Math.PI / 4.0)).toBeCloseTo(Math.sqrt(2) / 2.0);
    expect(evaluate(sin, Math.PI)).toBeCloseTo(0);
    expect(evaluate(sin, Math.PI * 3.0 / 2.0)).toBeCloseTo(-1);
    expect(evaluate(sin, 2 * Math.PI)).toBeCloseTo(0);
});

test('cosinus value function block', () => {
    let cos = new Function.Block(x => Math.cos(x));
    expect(evaluate(cos, 0)).toBeCloseTo(1);
    expect(evaluate(cos, Math.PI / 2.0)).toBeCloseTo(0);
    expect(evaluate(cos, Math.PI / 4.0)).toBeCloseTo(Math.sqrt(2) / 2.0);
    expect(evaluate(cos, Math.PI)).toBeCloseTo(-1);
    expect(evaluate(cos, Math.PI * 3.0 / 2.0)).toBeCloseTo(0);
    expect(evaluate(cos, 2 * Math.PI)).toBeCloseTo(1);
});

test('saturation function block', () => {
    const MAX = 10.0;
    let sat = new Function.Block(x => x < (-MAX) ? -MAX : x > MAX ? MAX : x);
    expect(evaluate(sat, 0)).toBe(0);
    expect(evaluate(sat, 1)).toBe(1);
    expect(evaluate(sat, 1.12)).toBe(1.12);
    expect(evaluate(sat, 5.6)).toBe(5.6);
    expect(evaluate(sat, 9.95)).toBe(9.95);
    expect(evaluate(sat, 9.999)).toBe(9.999);
    expect(evaluate(sat, 10)).toBe(10);
    expect(evaluate(sat, 10.1)).toBe(10);
    expect(evaluate(sat, 13.41)).toBe(10);
    expect(evaluate(sat, 14341)).toBe(10);
    expect(evaluate(sat, -5.1)).toBe(-5.1);
    expect(evaluate(sat, -10)).toBe(-10);
    expect(evaluate(sat, -10.2)).toBe(-10);
    expect(evaluate(sat, -53)).toBe(-10);
});