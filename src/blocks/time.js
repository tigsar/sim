import {StateBlock} from './base.js'

/* Definition of output and state signals */
export const output = Symbol('output');
const current = Symbol('current');

export class Block extends StateBlock {
    constructor(name) {
        super(
            name,
            [ ], /* Input signals */
            [ output ], /* Output signals */
            [ current ], /* State signals */
            [ ], /* Parameter signals */
            { }, /* Parameter bus */
            { [current]: 0 }, /* Initial condition */
            false);
    }

    update() {
        ++this.state[current];
    }

    output() {
        return {
            [output]: this.state[current] * this.updatePeriod /* Update period will be calculated by solver */
        };
    }
}