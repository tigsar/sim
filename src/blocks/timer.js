import {StateBlock} from './base.js'

/* Definition of output and state signals */
export const output = Symbol('output');
const current = Symbol('current');

/* Definition of parameter signals */
const maxValue = Symbol('max value');

export class Block extends StateBlock {
    constructor(name, maximum, updatePeriod) {
        super(
            name,
            [ ], /* Input signals */
            [ output ], /* Output signals */
            [ current ], /* State signals */
            [ maxValue ], /* Parameter signals */
            { [maxValue]: maximum }, /* Parameter bus */
            { [current]: 0 }, /* Initial condition */
            false,
            updatePeriod
        );
    }

    update() {
        this.state[current] = ++this.state[current] % (this.parameter[maxValue] + 1);
    }

    output() {
        return {
            [output]: this.state[current]
        };
    }
}