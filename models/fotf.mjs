import * as TransferFunction from './tf';

/* Definition of input signals */
export const input = Symbol('input');

/* Definition of output and state signals (including its derivatives) */
export const output = Symbol('output');

/**
 * Y(s) / U(s) = {K} / {tau * s + 1} = {K / tau} / {s + 1 / tau}
 * 
 * numerator   =       b1 * s^(n-1) + ... + b_(n-1) * s + b_n = K / tau
 * denominator = s^n + a1 * s^(n-1) + ... + a_(n-1) * s + a_n = s + 1 / tau
 * 
 * numerator   = [ b1, ..., bn ] = [ K / tau ]
 * denominator = [ a1, ..., an ] = [ 1 / tau ]
 */
export class Block extends TransferFunction.Block {
    constructor(name, K, tau) {
        super(name, input, output, [ K / tau ], [ 1 / tau ]);
    }
}