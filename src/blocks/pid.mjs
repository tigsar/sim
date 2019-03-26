import * as TransferFunction from './tf';

/* Definition of input signals */
export const input = Symbol('input');

/* Definition of output and state signals */
export const output = Symbol('output');

/**
 * Y(s) / U(s) = {(Kp * Ti * Td * (1 + N)) * s^2 + (Kp * (Td + N * Ti)) * s} / {(Ti * Td) * s^2 + (N * Ti) * s}
 * 
 * numerator   = b0 * s^n + b1 * s^(n-1) + ... + b_(n-1) * s + b_n = (Kp * Ti * Td * (1 + N) / (Ti * Td)) * s^2 + (Kp * (Td + N * Ti) / (Ti * Td)) * s
 * denominator =      s^n + a1 * s^(n-1) + ... + a_(n-1) * s + a_n = s^2 + ((N * Ti) / (Ti * Td)) * s
 * 
 * numerator   = [ b0, b1, ..., bn ] = [ Kp * Ti * Td * (1 + N) / (Ti * Td), Kp * (Td + N * Ti) / (Ti * Td), 0 ]
 * denominator = [ a1, ..., an ] = [ (N * Ti) / (Ti * Td), 0 ]
 */
export class Block extends TransferFunction.Block {
    constructor(name, Kp, Ti, Td, N, updatePeriod) {
        super(name, input, output,
            [ Kp * Ti * Td * (1 + N) / (Ti * Td), Kp * (Td + N * Ti) / (Ti * Td), 0 ],
            [ (N * Ti) / (Ti * Td), 0],
            updatePeriod);
    }
}