import {StateSpaceBlock} from './base.js'

/* Definition of parameter signals */
const num = Symbol('numerator coefficients');
const den = Symbol('denominator coefficients');

/* Definition of output and state signals (including its derivatives) */
const lastStateDerivative = Symbol('last state derivative');

class MalformedTransferFunction extends Error {}

/**
 * In what follows we will be assuming that the numerator's degree will be
 * always smaller or equal than the denominator's degree:
 * Y(s) / U(s) = numerator / denominator
 * 
 * numerator   = b0 * s^n + b1 * s^(n-1) + ... + b_(n-1) * s + b_n
 * denominator =      s^n + a1 * s^(n-1) + ... + a_(n-1) * s + a_n
 * 
 * The user provides the numerator and denominator arrays as follows:
 * numerator   = [ b0, b1, ..., bn ] of dimension n + 1
 * denominator = [ a1, ..., an ] of dimension n
 */
export class Block extends StateSpaceBlock {
    constructor(name, inputSignal, outputSignal, numerator, denominator, updatePeriod) {
        /* Denominator degree shall be bigger than the numerator degree */
        let n = denominator.length;
        if (n == 0 || numerator.length != (n + 1)) {
            throw new MalformedTransferFunction(`Denominator degree shall be bigger or equal than the numerator degree`);
        }

        /* Convert numerator and denominator */
        let denS = {}, numS = {};
        for (let i = 1; i <= n; ++i) {
            denS[i] = denominator[i - 1];
            numS[i - 1] = numerator[i - 1];
        }
        numS[n] = numerator[n];

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
            derivativesDef,
            numS[0] != 0,
            updatePeriod);
        
        this.inputSignal = inputSignal;
        this.outputSignal = outputSignal;
        this.stateSignalById = stateSignalById;
        this.n = n;
    }

    derivative(state, input) {
        this.checkInput(input);
        this.checkState(state);
        let d = {};
        for (let i = 2; i <= this.n; ++i) {
            d[this.stateSignalById[i]] = state[this.stateSignalById[i]];
        }
        let lastDerivative = 0.0;
        let a = this.parameter[den];
        for (let i = 1; i <= this.n; ++i) {
            lastDerivative -= state[this.stateSignalById[i]] * a[this.n - i + 1];
        }
        lastDerivative += input[this.inputSignal];
        d[lastStateDerivative] = lastDerivative;
        return d;
    }

    output(state, input) {
        this.checkState(state);
        let out = 0.0;
        let a = this.parameter[den];
        let b = this.parameter[num];
        for (let i = 1; i <= this.n; ++i) {
            out += state[this.stateSignalById[i]] * (b[i] - a[i] * b[0]);
        }
        
        if (this.inputRequired) {
            this.checkInput(input);
            out += b[0] * input[this.inputSignal];
        }
        return {
            [this.outputSignal]: out
        };
    }
}