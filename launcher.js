/* Definition of the symbols */
let momentOfInertia = Symbol('I');
let arm = Symbol('l');
let thrust = Symbol('T');
let angle = Symbol('theta');
let angularVelocity = Symbol('thetaD');
let angularAcceleration = Symbol('thetaDD');
let deflection = Symbol('beta');

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
        this.parameters = parameters;

        checkSymbol(initialCondition, angle);
        checkSymbol(initialCondition, angularVelocity);
        this.state = initialCondition;
        this.time = 0;
    }

    derivative(input) {
        checkSymbol(input, thrust);
        checkSymbol(input, deflection);
        return {
            [angularVelocity]: this.state[angularVelocity],
            [angularAcceleration]: ((input[thrust] * this.parameters[arm]) / this.parameters[momentOfInertia]) * Math.sin(input[deflection])
        };
    }
}

let launcher = new LauncherPlant({
    [momentOfInertia]: 10,
    [arm]: 1
}, {
    [angle]: 0,
    [angularVelocity]: 0.1
});

let integartor = new SimpleIntegrator(launcher, 0.01);
integartor.integrate({
    [thrust]: 100,
    [deflection]: 0.001
});

console.log(launcher.state)