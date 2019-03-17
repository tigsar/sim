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

class MissingSymbol extends Error {};
class MissingDerivative extends Error {};
class NotSupportedBlockType extends Error {};

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
            let derivativeOf = this.block.derivativesDef;
            if (symbol in derivativeOf) {
                this.block.state[symbol] += derivative[derivativeOf[symbol]] * this.dt;
            } else {
                throw new MissingDerivative(`Cannot find the derivative of ${symbol.toString()}`);
            }
        }
        this.time += this.dt;
    }
}

class CommonBlock {
    constructor(inputSignals, outputSignals, parameterSignals, parameter) {
        this.parameterSignals = parameterSignals;
        this.checkParameter(parameter);
        this.parameter = parameter;
        this.inputSignals = inputSignals;
        this.outputSignals = outputSignals;
    }

    checkInput(input) {
        for (let signal of this.inputSignals) {
            checkSymbol(input, signal);
        }
    }

    checkOutput(output) {
        for (let signal of this.outputSignals) {
            checkSymbol(output, signal);
        }
    }

    checkParameter(parameter) {
        for (let signal of this.parameterSignals) {
            checkSymbol(parameter, signal);
        }
    }
}

class DirectBlock extends CommonBlock { }

class DynamicBlock extends CommonBlock {
    constructor(inputSignals, outputSignals, stateSignals, parameterSignals, parameter, initialCondition, derivativesDef) {
        super(inputSignals, outputSignals, parameterSignals, parameter);
        this.stateSignals = stateSignals;
        this.checkState(initialCondition);
        this.state = initialCondition;
        this.derivativesDef = derivativesDef;
        this.time = 0;
    }

    checkState(state) {
        for (let signal of this.stateSignals) {
            checkSymbol(state, signal);
        }
    }
}

class LauncherPlant extends DynamicBlock {
    constructor(parameter, initialCondition) {
        super(
            [ deflection ], /* Input signals */
            [ angle ], /* Output signals */
            [ angle, angularVelocity ], /* State signals */
            [ momentOfInertia, arm, thrust ], /* Parameter signals */
            parameter,
            initialCondition, {
                [angle]: angularVelocity,
                [angularVelocity]: angularAcceleration
            }
        );
    }

    derivative(input) {
        this.checkInput(input)
        return {
            [angularVelocity]: this.state[angularVelocity],
            [angularAcceleration]: ((this.parameter[thrust] * this.parameter[arm]) / this.parameter[momentOfInertia]) * Math.sin(input[deflection])
        };
    }

    output() {
        return {
            [angle]: this.state[angle]
        };
    }
}

class AngleSensor extends DirectBlock {
    constructor(parameter) {
        super(
            [ angle ], /* Input signals */
            [ measuredAngle ], /* Output signals */
            [ scaleFactor, bias, noiseVariance ], /* Parameter signals */
            parameter
        );
    }

    output(input) {
        this.checkInput(input);
        return {
            [measuredAngle]: input[angle] * this.parameter[scaleFactor] + this.parameter[bias] + Math.sqrt(this.parameter[noiseVariance]) * Math.random()
        };
    }
}

class NozzleActuator extends DynamicBlock {
    constructor(parameter, initialCondition) {
        super(
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

class ProportionalController extends DirectBlock {
    constructor(parameter) {
        super(
            [ measuredAngle ], /* Input signals */
            [ commandedDeflection ], /* Output signals */
            [ controllerGain, reference ], /* Parameter signals */
            parameter
        );
    }

    output(input) {
        this.checkInput(input);
        return {
            [commandedDeflection]: this.parameter[controllerGain] * (input[measuredAngle] - this.parameter[reference])
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

class Solver {
    constructor(blocks, links) {
        this.blocks = blocks;
        this.links = links;
    }

    solve() {
        /* It is assumed that the blocks are ordered in a proper order */
        for (let block of this.blocks) {
            block._solver = block._solver || {};

            /* Compute the output of the block */
            if (block instanceof DynamicBlock) {
                /* Dynamic Blocks do not need the current cycle's input to calculate the output */
                block._solver.output = block.output();
            } else if (block instanceof DirectBlock) {
                /* Direct Blocks need the current cycle's input to calculate the output */
                block._solver.output = block.output(block._solver.input);
            } else {
                throw new NotSupportedBlockType(`The solver does not support ${block} type blocks`);
            }

            /* For each block output signal, propagate the signal until next immediate blocks's inputs */
            for (let outputSignal of Object.getOwnPropertySymbols(block._solver.output)) {
                let wiring = this._getSignalWiring(block, outputSignal);
                for (let wire of wiring) {
                    wire.block._solver = wire.block._solver || {};
                    wire.block._solver.input = wire.block._solver.input || {};
                    wire.block._solver.input[wire.signal] = block._solver.output[outputSignal];
                }
            }
        }
    }
    
    _getSignalWiring(block, signal) {
        let output = [];
        for (let link of this.links) {
            if (link.from.block == block && link.from.signal == signal) {
                output.push(link.to);
            }
        }
        return output;
    }
}

let solver = new Solver([
    actuator,
    plant,
    sensor,
    controller
], [
    {
        from: { block: plant, signal: angle },
        to: { block: sensor, signal: angle }
    },
    {
        from: { block: sensor, signal: measuredAngle },
        to: { block: controller, signal: measuredAngle }
    },
    {
        from: { block: controller, signal: commandedDeflection },
        to: { block: actuator, signal: commandedDeflection }
    },
    {
        from: { block: actuator, signal: deflection },
        to: { block: plant, signal: deflection }
    }
]);

solver.solve();

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
    let actuatorOutput = actuator.output();
    let plantInput = {
        [deflection]: actuatorOutput[deflection]
    };

    let plantOutput = plant.output();
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