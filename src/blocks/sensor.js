import {DirectBlock} from './base.js'

/* Definition of input signals */
export const angle = Symbol('theta');

/* Definition of output and state signals (including its derivatives) */
export const measuredAngle = Symbol('theta_m');

/* Definition of parameter signals */
export const scaleFactor = Symbol('s');
export const bias = Symbol('b');
export const noiseVariance = Symbol('sigma');

export class Block extends DirectBlock {
    constructor(parameter) {
        super(
            "Sensor",
            [ angle ], /* Input signals */
            [ measuredAngle ], /* Output signals */
            [ scaleFactor, bias, noiseVariance ], /* Parameter signals */
            parameter
        );
    }

    output(input) {
        this.checkInput(input);
        return {
            [measuredAngle]: input[angle] * this.parameter[scaleFactor] + this.parameter[bias] + Math.sqrt(this.parameter[noiseVariance]) * Math.random()
        };
    }
}