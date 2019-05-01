import {StateBlock} from './base.js'

/* Definition of input signals */
export const input = Symbol('input');

/* Definition of output and state signals */
export const output = Symbol('output');
const current = Symbol('current');

export class Block extends StateBlock {
    constructor(name, updatePeriod) {
        super(
            name,
            [ input ], /* Input signals */
            [ output ], /* Output signals */
            [ current ], /* State signals */
            [ ], /* Parameter signals */
            { }, /* Parameter bus */
            { [current]: 0 }, /* Initial condition */
            false,
            updatePeriod
        );
    }

    update(inputBus) {
        this.checkInput(inputBus);
        this.state[current] = inputBus[input];
    }

    output() {
        return {
            [output]: this.state[current]
        };
    }
}