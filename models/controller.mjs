import {DirectBlock} from './../simulation.mjs'

/* Definition of input signals */
export const measuredAngle = Symbol('theta_m');

/* Definition of output and state signals (including its derivatives) */
export const commandedDeflection = Symbol('beta_c');

/* Definition of parameter signals */
export const controllerGain = Symbol('K_p');
export const reference = Symbol('theta_r');

export class Block extends DirectBlock {
    constructor(parameter) {
        super(
            "Controller",
            [ measuredAngle ], /* Input signals */
            [ commandedDeflection ], /* Output signals */
            [ controllerGain, reference ], /* Parameter signals */
            parameter
        );
    }

    output(input) {
        this.checkInput(input);
        return {
            [commandedDeflection]: this.parameter[controllerGain] * (input[measuredAngle] - this.parameter[reference])
        };
    }
}