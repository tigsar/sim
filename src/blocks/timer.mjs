import {StateBlock} from './base'

/* Definition of output and state signals */
export const output = Symbol('output');
export const current = Symbol('current');

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
            {
                [maxValue]: maximum
            },
            {
                [current]: 0
            },
            false,
            updatePeriod
        );
    }

    update() {
        ++this.state[current];
        if (this.state[current] > this.parameter[maxValue]) {
            this.state[current] = 0;
        }
    }

    output() {
        return {
            [output]: this.state[current]
        };
    }
}