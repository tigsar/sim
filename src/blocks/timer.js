import {StateBlock} from './base.js'

/* Definition of output and state signals */
export const output = Symbol('output');
export const current = Symbol('current');

/* Definition of parameter signals */
export const maxValue = Symbol('max value');

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

    update(state) {
        this.checkState(state);
        let newState = {};
        newState[current] = ++state[current] % (this.parameter[maxValue] + 1);
        return newState;
    }

    output(state) {
        this.checkState(state);
        return {
            [output]: state[current]
        };
    }
}