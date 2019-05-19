import * as Timer from './timer.js'

/* Definition of output and state signals */
export const output = Symbol('output');

export class Block extends Timer.Block {
    constructor(name) {
        super(name, Number.MAX_SAFE_INTEGER);
    }

    output(state) {
        return {
            [output]: super.output(state)[Timer.output] * this.updatePeriod /* Update period will be calculated by solver */
        };
    }
}