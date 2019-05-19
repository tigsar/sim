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

    update(stateBus, inputBus) {
        this.checkInput(inputBus);
        this.checkState(stateBus);
        let newState = {};
        newState[current] = inputBus[input];
        return newState;
    }

    output(state) {
        this.checkState(state);
        return {
            [output]: state[current]
        };
    }
}