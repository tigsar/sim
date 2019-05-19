import {StateSpaceBlock} from './base.js'

/* Definition of input signals */
export const commandedDeflection = Symbol('beta_c');

/* Definition of output and state signals (including its derivatives) */
export const deflection = Symbol('beta');
export const deflectionAngularVelocity = Symbol('betaD');
export const deflectionAngularAcceleration = Symbol('betaDD');

/* Definition of parameter signals */
export const actuatorNaturalFrequency = Symbol('omega_s');
export const actuatorDampingRatio = Symbol('zeta_s');

export class Block extends StateSpaceBlock {
    constructor(parameter, initialCondition) {
        super(
            "Actuator",
            [ commandedDeflection ], /* Input signals */
            [ deflection ], /* Output signals */
            [ deflection, deflectionAngularVelocity ], /* State signals */
            [ actuatorNaturalFrequency, actuatorDampingRatio ], /* Parameter signals */
            parameter,
            initialCondition, {
                [deflection]: deflectionAngularVelocity,
                [deflectionAngularVelocity]: deflectionAngularAcceleration
            },
            false
        );
    }

    derivative(state, input) {
        this.checkInput(input);
        this.checkState(state);
        let naturalFrequencySquare = Math.pow(this.parameter[actuatorNaturalFrequency], 2);
        return {
            [deflectionAngularVelocity]: state[deflectionAngularVelocity],
            [deflectionAngularAcceleration]: naturalFrequencySquare * input[commandedDeflection] - naturalFrequencySquare * state[deflection] - 2 * this.parameter[actuatorNaturalFrequency] * this.parameter[actuatorDampingRatio] * state[deflectionAngularVelocity]
        };
    }

    output(state) {
        this.checkState(state);
        return {
            [deflection]: state[deflection]
        };
    }
}