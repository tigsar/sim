import {StateSpaceBlock} from './base'

/* Definition of input signals */
export const deflection = Symbol('beta');

/* Definition of output and state signals (including its derivatives) */
export const angle = Symbol('theta');
export const angularVelocity = Symbol('thetaD');
export const angularAcceleration = Symbol('thetaDD');

/* Definition of parameter signals */
export const momentOfInertia = Symbol('I');
export const arm = Symbol('l');
export const thrust = Symbol('T');

export class Block extends StateSpaceBlock {
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
            },
            false
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