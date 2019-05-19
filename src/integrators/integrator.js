export class MissingDerivative extends Error {}

export class Integrator {
    constructor(derivateClass, derivativesDef, timeStep) {
        this.timeStep = timeStep;
        this.derivateClass = derivateClass;
        this.derivativesDef = derivativesDef;
    }
}