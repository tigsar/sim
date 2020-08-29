import {DirectBlock} from './base.js'

/* Definition of input signals */
export const input = Symbol('input');

/* Definition of output signals */
export const output = Symbol('output');

/**
 * Function generator:
 * 1) sine wave
 * 2) square wave
 * 3) PWM
 * 4) Triangle
 * 
 * Constant(k):        k
 * Step(t0, k):        if t < t0 ? 0 : k
 * Condition(c, a, b)  if c ? a : b
 * 
 * With time input:
 * step(t0, k) = condition(t < t0, 0, k)
 * ramp(t0)    = condition(t < t0, 0, t - t0)
 * 
 * With timer input of period p:
 * square(low, high)   = condition(t < p / 2, low, high)
 */
export class Block extends DirectBlock {
    constructor(funcDef) {
        super(
            "Function",
            [ input ], /* Input signals */
            [ output ], /* Output signals */
            [ ], /* Parameter signals */
            { }
        );
        this.funcDef = funcDef;
    }

    output(inputBus) {
        this.checkInput(inputBus);
        return {
            [output]: this.funcDef(inputBus[input])
        };
    }
}