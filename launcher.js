/* Definition of the symbols */
let momentOfInertia = Symbol('I');
let arm = Symbol('l');
let thrust = Symbol('T');
let angle = Symbol('theta');
let angularVelocity = Symbol('thetaD');
let angularAcceleration = Symbol('thetaDD');
let deflection = Symbol('beta');

let deflectionAngularVelocity = Symbol('betaD');
let deflectionAngularAcceleration = Symbol('betaDD');
let actuatorNaturalFrequency = Symbol('omega_s');
let actuatorDampingRatio = Symbol('zeta_s');
let commandedDeflection = Symbol('beta_c');

let controllerGain = Symbol('K_p');
let reference = Symbol('theta_r');

let scaleFactor = Symbol('s');
let bias = Symbol('b');
let noiseVariance = Symbol('sigma');
let measuredAngle = Symbol('theta_m');

/* Definition of derivatives */
let derivativeOf = {
    [angle]: angularVelocity,
    [angularVelocity]: angularAcceleration
};

class MissingSymbol extends Error {};

function checkSymbol(obj, symbol) {
    if (!(symbol in obj))
        throw new MissingSymbol(`${symbol.toString()} is missing`);
}

class SimpleIntegrator {
    constructor(block, dt) {
        this.dt = dt;
        this.block = block;
    }

    integrate(input) {
        let derivative = this.block.derivative(input);
        for (let symbol of Object.getOwnPropertySymbols(this.block.state)) { /* Iterate all symbols of the state */
            this.block.state[symbol] += derivative[derivativeOf[symbol]] * this.dt;
        }
    }
}

class LauncherPlant {
    constructor(parameters, initialCondition) {
        // FIXME can be improved (e.g. passing list of symbols to super constructor)
        checkSymbol(parameters, momentOfInertia);
        checkSymbol(parameters, arm);
        checkSymbol(parameters, thrust);
        this.parameters = parameters;

        checkSymbol(initialCondition, angle);
        checkSymbol(initialCondition, angularVelocity);
        this.state = initialCondition;
        this.time = 0;
    }

    derivative(input) {
        checkSymbol(input, deflection);
        return {
            [angularVelocity]: this.state[angularVelocity],
            [angularAcceleration]: ((this.parameters[thrust] * this.parameters[arm]) / this.parameters[momentOfInertia]) * Math.sin(input[deflection])
        };
    }

    output(input, derivative) {
        checkSymbol(input, deflection);
        return {
            [angle]: this.state[angle]
        };
    }
}

class AngleSensor {
    constructor(parameters) {
        checkSymbol(parameters, scaleFactor);
        checkSymbol(parameters, bias);
        checkSymbol(parameters, noiseVariance);
        this.parameters = parameters;
    }

    output(input) {
        checkSymbol(input, angle);
        return {
            [measuredAngle]: input[angle] * this.parameters[scaleFactor] + this.parameters[bias] + Math.sqrt(this.parameters[noiseVariance]) * Math.random()
        };
    }
}

class NozzleActuator {
    constructor(parameters, initialCondition) {
        checkSymbol(parameters, actuatorNaturalFrequency);
        checkSymbol(parameters, actuatorDampingRatio);
        this.parameters = parameters;

        checkSymbol(initialCondition, deflection);
        checkSymbol(initialCondition, deflectionAngularVelocity);
        this.state = initialCondition;
        this.time = 0;
    }

    derivative(input) {
        checkSymbol(input, commandedDeflection);
        let naturalFrequencySquare = Math.pow(this.parameters[actuatorNaturalFrequency], 2);
        return {
            [deflectionAngularVelocity]: this.state[deflectionAngularVelocity],
            [deflectionAngularAcceleration]: naturalFrequencySquare * input[commandedDeflection] - naturalFrequencySquare * this.state[deflection] - 2 * this.parameters[actuatorNaturalFrequency] * this.parameters[actuatorDampingRatio] * this.state[deflectionAngularVelocity]
        };
    }

    output(input, derivative) {
        checkSymbol(input, commandedDeflection);
        return {
            [deflection]: this.state[deflection]
        };
    }
}

class ProportionalController {
    constructor(parameters) {
        checkSymbol(parameters, controllerGain);
        checkSymbol(parameters, reference);
        this.parameters = parameters;
        this.time = 0;
    }

    output(input, derivative) {
        checkSymbol(input, angle);
        return {
            [commandedDeflection]: this.parameters[controllerGain] * (input[angle] - this.parameters[reference])
        };
    }
}

let launcher = new LauncherPlant({
    [momentOfInertia]: 10,
    [arm]: 1,
    [thrust]: 100
}, {
    [angle]: 0,
    [angularVelocity]: 0.1
});

let sensor = new AngleSensor({
    [scaleFactor]: 1.01,
    [bias]: 0.1,
    [noiseVariance]: 0.1
});

let actuator = new NozzleActuator({
    [actuatorNaturalFrequency]: 80,
    [actuatorDampingRatio]: 0.7,
}, {
    [deflection]: 0,
    [deflectionAngularVelocity]: 0
});

let controller = new ProportionalController({
    [controllerGain]: 1,
    [reference]: 0
});

/* Models wiring */

let integartor = new SimpleIntegrator(launcher, 0.01);
integartor.integrate({
    [thrust]: 100,
    [deflection]: 0.001
});

console.log(launcher.state);