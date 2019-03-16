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
    [angularVelocity]: angularAcceleration,
    [deflection]: deflectionAngularVelocity,
    [deflectionAngularVelocity]: deflectionAngularAcceleration
};

class MissingSymbol extends Error {};
class MissingDerivative extends Error {};

function checkSymbol(obj, symbol) {
    if (!(symbol in obj))
        throw new MissingSymbol(`${symbol.toString()} is missing`);
}

class SimpleIntegrator {
    constructor(block, dt) {
        this.dt = dt;
        this.block = block;
        this.time = 0;
    }

    integrate(input) {
        let derivative = this.block.derivative(input);
        for (let symbol of Object.getOwnPropertySymbols(this.block.state)) { /* Iterate all symbols of the state */
            if (symbol in derivativeOf) {
                this.block.state[symbol] += derivative[derivativeOf[symbol]] * this.dt;
            } else {
                throw new MissingDerivative(`Cannot find the derivative of ${symbol.toString()}`);
            }
        }
        this.time += this.dt;
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

    output(input) {
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

    output(input) {
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

    output(input) {
        checkSymbol(input, measuredAngle);
        return {
            [commandedDeflection]: this.parameters[controllerGain] * (input[measuredAngle] - this.parameters[reference])
        };
    }
}

let plant = new LauncherPlant({
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
    [noiseVariance]: 0
});

let actuator = new NozzleActuator({
    [actuatorNaturalFrequency]: 80,
    [actuatorDampingRatio]: 0.7,
}, {
    [deflection]: 0,
    [deflectionAngularVelocity]: 0
});

let controller = new ProportionalController({
    [controllerGain]: -1,
    [reference]: 0
});

let plantIntegrator = new SimpleIntegrator(plant, 0.01);
let actuatorIntegrator = new SimpleIntegrator(actuator, 0.01);

class Logger {
    constructor() {
        this.firstTime = true;
    }
    log(t, buses) {
        let header = "t,", data = "";
        data += t + ",";
        let processedSignal = {};
        for (let bus of buses) {
            for (let signal of Object.getOwnPropertySymbols(bus)) {
                if (!(signal in processedSignal)) {
                    processedSignal[signal] = true;
                    if (this.firstTime) header += signal.toString() + ",";
                    data += bus[signal] + ",";
                }
            }
        }
        if (this.firstTime) {
            console.log(header);
            this.firstTime = false;
        }
        console.log(data);
    }
}

let logger = new Logger();
let N = 1001;
for (let n = 0; n <= N; n++) {
    /* 
     * Step 1: For each model with an internal dynamic state
     *      1.1) Evaluate the output of models (with null input)
     *      1.2) Propagate the output according to the wiring
     */
    let actuatorOutput = actuator.output(null);
    let plantInput = {
        [deflection]: actuatorOutput[deflection]
    };

    let plantOutput = plant.output(null);
    let sensorInput = {
        [angle]: plantOutput[angle]
    };

    /*
     * Step 2: For each model without an internal dynamic state and in proper order
     *      2.1) Evaluate the output of all model (with the corresponding input)
     *      2.2) Propagate the output according to the wiring
     */
    let sensorOutput = sensor.output(sensorInput);
    let controllerInput = {
        [measuredAngle]: sensorOutput[measuredAngle]
    };

    let controllerOutput = controller.output(controllerInput);
    let actuatorInput = {
        [commandedDeflection]: controllerOutput[commandedDeflection]
    };
    logger.log(actuatorIntegrator.time, [
        actuator.state,
        plant.state,
        actuatorOutput,
        plantOutput,
        sensorOutput,
        controllerOutput,
    ]);

    /* 
     * Step 3: For each model with an internal dynamic state, update the internal state
     */
    actuatorIntegrator.integrate(actuatorInput);
    plantIntegrator.integrate(plantInput);
}