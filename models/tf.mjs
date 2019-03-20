import {DynamicBlock} from './../simulation.mjs'

/* Definition of parameter signals */
const num = Symbol('numerator coefficients');
const den = Symbol('denominator coefficients');

/* Definition of output and state signals (including its derivatives) */
const lastStateDerivative = Symbol('last state derivative');

class MalformedTransferFunction extends Error {};

/**
 * In what follows we will be assuming that the numerator's degree will be
 * always smaller than the denominator's degree:
 * Y(s) / U(s) = numerator / denominator
 * 
 * numerator   =       b1 * s^(n-1) + ... + b_(n-1) * s + b_n
 * denominator = s^n + a1 * s^(n-1) + ... + a_(n-1) * s + a_n
 * 
 * The user provides the numerator and denominator arrays as follows:
 * numerator   = [ b1, ..., bn ] of dimension n
 * denominator = [ a1, ..., an ] of dimension n
 */
export class Block extends DynamicBlock {
    constructor(name, inputSignal, outputSignal, numerator, denominator) {
        /* Denominator degree shall be bigger than the numerator degree */
        let n = denominator.length;
        if (numerator.length > n) {
            throw new MalformedTransferFunction(`Denominator degree shall be bigger than the numerator degree`);
        }

        /* Convert numerator and denominator */
        let denS = {}, numS = {};
        for (let i = 1; i <= n; ++i) {
            denS[i] = denominator[i - 1];
            numS[i] = numerator[i - 1];
        }

        /* There will be n state signals with zero initial condition */
        let stateSignals = [];
        let stateSignalById = {};
        let initialCondition = {};
        for (let i = 1; i <= n; ++i) {
            stateSignalById[i] = Symbol(`x${i}`);
            stateSignals.push(stateSignalById[i]);
            initialCondition[stateSignalById[i]] = 0;
        }

        /* Define the derivatives */
        let derivativesDef = {};
        for (let i = 1; i < n; ++i) {
            derivativesDef[stateSignalById[i]] = stateSignalById[i + 1];
        }
        derivativesDef[stateSignalById[n]] = lastStateDerivative;

        super(
            name,
            [ inputSignal ],  /* Input signals */
            [ outputSignal ], /* Output signals */
            stateSignals, /* State signals */
            [ num, den ], /* Parameter signals */
            { [num]: numS, [den]: denS },
            initialCondition,
            derivativesDef);
        
        this.inputSignal = inputSignal;
        this.outputSignal = outputSignal;
        this.stateSignalById = stateSignalById;
        this.n = n;
    }

    derivative(input) {
        this.checkInput(input);
        let d = {};
        for (let i = 2; i <= this.n; ++i) {
            d[this.stateSignalById[i]] = this.state[this.stateSignalById[i]];
        }
        let lastDerivative = 0.0;
        let a = this.parameter[num];
        for (let i = 1; i <= this.n; ++i) {
            lastDerivative -= this.state[this.stateSignalById[i]] * a[this.n - i + 1];
        }
        lastDerivative += input[this.inputSignal];
        d[lastStateDerivative] = lastDerivative;
        return d;
    }

    output() {
        let out = 0.0;
        let b = this.parameter[den];
        for (let i = 1; i <= this.n; ++i) {
            out += this.state[this.stateSignalById[i]] * b[i];
        }
        return {
            [this.outputSignal]: out
        };
    }
}