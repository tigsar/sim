import {DynamicBlock} from './../simulation.mjs'

/* Definition of input signals */
export let deflection = Symbol('beta');

/* Definition of output and state signals (including its derivatives) */
export let angle = Symbol('theta');
export let angularVelocity = Symbol('thetaD');
export let angularAcceleration = Symbol('thetaDD');

/* Definition of parameter signals */
export let momentOfInertia = Symbol('I');
export let arm = Symbol('l');
export let thrust = Symbol('T');

export class Block extends DynamicBlock {
    constructor(parameter, initialCondition) {
        super(
            "Plant",
            [ deflection ], /* Input signals */
            [ angle ], /* Output signals */
            [ angle, angularVelocity ], /* State signals */
            [ momentOfInertia, arm, thrust ], /* Parameter signals */
            parameter,
            initialCondition, {
                [angle]: angularVelocity,
                [angularVelocity]: angularAcceleration
            }
        );
    }

    derivative(input) {
        this.checkInput(input)
        return {
            [angularVelocity]: this.state[angularVelocity],
            [angularAcceleration]: ((this.parameter[thrust] * this.parameter[arm]) / this.parameter[momentOfInertia]) * Math.sin(input[deflection])
        };
    }

    output() {
        return {
            [angle]: this.state[angle]
        };
    }
}