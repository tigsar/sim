import {Integrator, MissingDerivative} from './integrator.js'

/* 
 * Euler method
 * x{n+1} = x{n} + h * f(t{n}, x{n})
 * t{n+1} = t{n} + h
 */
export class EulerIntegrator extends Integrator {
    integrate(state, input) {
        let derivative = this.derivateClass.derivative(state, input);
        let derivativeOf = this.derivativesDef;
        let newState = {};
        for (let signal of Object.getOwnPropertySymbols(state)) { /* Iterate all signal of the state */
            if (signal in derivativeOf) {
                let signalDerivative = derivativeOf[signal];
                newState[signal] = state[signal] + derivative[signalDerivative] * this.timeStep;
            } else {
                throw new MissingDerivative(`Cannot find the derivative of ${signal.toString()}`);
            }
        }
        return newState;
    }
}