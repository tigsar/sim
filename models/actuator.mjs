import {DynamicBlock} from './../simulation.mjs'

/* Definition of input signals */
export let commandedDeflection = Symbol('beta_c');

/* Definition of output and state signals (including its derivatives) */
export let deflection = Symbol('beta');
export let deflectionAngularVelocity = Symbol('betaD');
export let deflectionAngularAcceleration = Symbol('betaDD');

/* Definition of parameter signals */
export let actuatorNaturalFrequency = Symbol('omega_s');
export let actuatorDampingRatio = Symbol('zeta_s');

export class Block extends DynamicBlock {
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
            }
        );
    }

    derivative(input) {
        this.checkInput(input);
        let naturalFrequencySquare = Math.pow(this.parameter[actuatorNaturalFrequency], 2);
        return {
            [deflectionAngularVelocity]: this.state[deflectionAngularVelocity],
            [deflectionAngularAcceleration]: naturalFrequencySquare * input[commandedDeflection] - naturalFrequencySquare * this.state[deflection] - 2 * this.parameter[actuatorNaturalFrequency] * this.parameter[actuatorDampingRatio] * this.state[deflectionAngularVelocity]
        };
    }

    output() {
        return {
            [deflection]: this.state[deflection]
        };
    }
}