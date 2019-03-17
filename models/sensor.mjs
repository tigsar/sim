import {DirectBlock} from './../simulation.mjs'

/* Definition of input signals */
export let angle = Symbol('theta');

/* Definition of output and state signals (including its derivatives) */
export let measuredAngle = Symbol('theta_m');

/* Definition of parameter signals */
export let scaleFactor = Symbol('s');
export let bias = Symbol('b');
export let noiseVariance = Symbol('sigma');

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