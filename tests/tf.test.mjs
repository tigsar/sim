import * as Tf from './blocks/tf';

const inputSignal = Symbol('Input signal');
const outputSignal = Symbol('Output signal');

const newInstance = (num, den) => {
    return () => new Tf.Block("Test", inputSignal, outputSignal, num, den);
};

test('Malformed transfer functions', () => {
    expect(newInstance([], [])).toThrow(Tf.MalformedTransferFunction);
    expect(newInstance([], [1])).toThrow(Tf.MalformedTransferFunction);
    expect(newInstance([1], [])).toThrow(Tf.MalformedTransferFunction);
    expect(newInstance([1], [1])).toThrow(Tf.MalformedTransferFunction);
    expect(newInstance([2, 4, 6], [3, 5, 7])).toThrow(Tf.MalformedTransferFunction);
    expect(newInstance([1, 2, 4, 6, 8], [3, 5, 7])).toThrow(Tf.MalformedTransferFunction);
});

test('Well formed transfer functions', () => {
    /* 2s^3 + 4s^2 + 6s + 8
     * ---------------------
     * s^3 + 3s^2 + 5s^2 + 7 */
    expect(newInstance([2, 4, 6, 8], [3, 5, 7])).not.toThrow(Tf.MalformedTransferFunction);
});

test('Output dependency', () => {
    /* 2s^3 + 4s^2 + 6s + 8
     * ---------------------
     * s^3 + 3s^2 + 5s^2 + 7 */
    expect(newInstance([2, 4, 6, 8], [3, 5, 7])().inputRequired).toBe(true);

    /*       4s^2 + 6s + 8
     * ---------------------
     * s^3 + 3s^2 + 5s^2 + 7 */
    expect(newInstance([0, 4, 6, 8], [3, 5, 7])().inputRequired).toBe(false);
    expect(newInstance([0.0, 4, 6, 8], [3, 5, 7])().inputRequired).toBe(false);

    /*  10
     * ----
     *  s  */
    expect(newInstance([0, 10], [0])().inputRequired).toBe(false);

    /*  10
     * ------
     *  s + 1  */
    expect(newInstance([0, 10], [1])().inputRequired).toBe(false);

    /*   10s
     * ------
     *  s + 1  */
    expect(newInstance([10, 0], [1])().inputRequired).toBe(true);

    /*  s - 1
     * ------
     *  s + 1  */
    expect(newInstance([1, -1], [1])().inputRequired).toBe(true);
});