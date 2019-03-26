import * as TransferFunction from './tf';

/* Definition of input signals */
export const input = Symbol('input');

/* Definition of output and state signals (including its derivatives) */
export const output = Symbol('output');

/**
 * Y(s) / U(s) = {K * omega^2} / {s^2 + (2 * zi * omega) * s + omega^2}
 * 
 * numerator   = b0 * s^n + b1 * s^(n-1) + ... + b_(n-1) * s + b_n = K * omega^2
 * denominator =      s^n + a1 * s^(n-1) + ... + a_(n-1) * s + a_n = s^2 + (2 * zi * omega) * s + omega^2
 * 
 * numerator   = [ b0, b1, ..., bn ] = [ 0, 0, K * omega^2 ]
 * denominator = [ a1, ..., an ] = [ 2 * zi * omega, omega^2 ]
 */
export class Block extends TransferFunction.Block {
    constructor(name, K, omega, zi, updatePeriod) {
        super(name, input, output,
            [ 0, 0, K * omega^2 ],
            [ 2 * zi * omega, omega^2 ],
            updatePeriod);
    }
}