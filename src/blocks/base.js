import {isInBus} from '../bus.js'
import {RungeKuttaIntegrator} from '../integrators/runge-kutta-integrator.js';

class MissingSignal extends Error {}

function checkSignal(bus, signal) {
    if (!isInBus(bus, signal))
        throw new MissingSignal(`${signal.toString()} is not found in the bus`);
}

class CommonBlock {
    constructor(name, inputSignals, outputSignals, parameterSignals, parameter, updatePeriod) {
        this.name = name;
        this.parameterSignals = parameterSignals;
        this.checkParameter(parameter);
        this.parameter = parameter;
        this.inputSignals = inputSignals;
        this.outputSignals = outputSignals;
        this.updatePeriod = updatePeriod;
    }

    checkInput(input) {
        for (let signal of this.inputSignals) {
            checkSignal(input, signal);
        }
    }

    checkOutput(output) {
        for (let signal of this.outputSignals) {
            checkSignal(output, signal);
        }
    }

    checkParameter(parameter) {
        for (let signal of this.parameterSignals) {
            checkSignal(parameter, signal);
        }
    }

    toString() {
        return this.name;
    }
}

export class DirectBlock extends CommonBlock { }

export class StateBlock extends CommonBlock {
    constructor(name, inputSignals, outputSignals, stateSignals, parameterSignals, parameter, initialCondition, inputRequired, updatePeriod) {
        super(name, inputSignals, outputSignals, parameterSignals, parameter, updatePeriod);
        this.stateSignals = stateSignals;
        this.checkState(initialCondition);
        this.initialCondition = initialCondition;
        this.inputRequired = inputRequired; /* if true it means that input bus is needed for output evaluation */
        this.time = 0;
    }

    checkState(state) {
        for (let signal of this.stateSignals) {
            checkSignal(state, signal);
        }
    }
}

export class StateSpaceBlock extends StateBlock {
    constructor(name, inputSignals, outputSignals, stateSignals, parameterSignals, parameter, initialCondition, derivativesDef, inputRequired, updatePeriod) {
        super(name, inputSignals, outputSignals, stateSignals, parameterSignals, parameter, initialCondition, inputRequired, updatePeriod);
        this.derivativesDef = derivativesDef;
    }

    update(state, input) {
        this.checkState(state);
        /* integrator is not initialized in constructor as updatePeriod could be unknown and thus re-computed by the solver */
        this.integrator = this.integrator || new RungeKuttaIntegrator(this, this.derivativesDef, this.updatePeriod);
        return this.integrator.integrate(state, input);
    }
}