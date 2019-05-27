import {Integrator, MissingDerivative} from './integrator.js'
import {scaleBus, sumBus} from '../bus.js'

/* 
 * Runge–Kutta method
 * x{n+1} = x{n} + (1/6) * (k1 + 2 * k2 + 2 * k3 + k4)
 * t{n+1} = t{n} + h
 * k1 = h * f(t{n}, x{n})
 * k2 = h * f(t{n} + h / 2, x{n} + k1 / 2)
 * k3 = h * f(t{n} + h / 2, x{n} + k2 / 2)
 * k4 = h * f(t{n} + h, x{n} + k3)
 */
export class RungeKuttaIntegrator extends Integrator {
    integrate(state, input) {
        let derivativeOf = this.derivativesDef;

        let convert = function(bus) {
            let cbus = {};
            for (let signal of Object.getOwnPropertySymbols(state)) {
                if (signal in derivativeOf) {
                    cbus[signal] = bus[derivativeOf[signal]];
                } else {
                    throw new MissingDerivative(`Cannot find the derivative of ${signal.toString()}`);
                }
            }
            return cbus;
        };

        let k1 = convert(this.derivateClass.derivative(state, input));
        let k2 = convert(this.derivateClass.derivative(sumBus([state, scaleBus(k1, 0.5 * this.timeStep)]), input));
        let k3 = convert(this.derivateClass.derivative(sumBus([state, scaleBus(k2, 0.5 * this.timeStep)]), input));
        let k4 = convert(this.derivateClass.derivative(sumBus([state, scaleBus(k3, this.timeStep)]), input));
        return sumBus([
            state, 
            scaleBus(
                sumBus([k1, scaleBus(k2, 2), scaleBus(k3, 2), k4]),
                (1.0 / 6.0) * this.timeStep)]);
    }
}