import * as Actuator from './blocks/actuator';
import * as Plant from './blocks/plant';
import * as Controller from './blocks/controller';
import * as Sensor from './blocks/sensor';
import {Solver} from './solver';

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

let plant = new Plant.Block({
    [Plant.momentOfInertia]: 10,
    [Plant.arm]: 1,
    [Plant.thrust]: 100
}, {
    [Plant.angle]: 0,
    [Plant.angularVelocity]: 0.1
});

let sensor = new Sensor.Block({
    [Sensor.scaleFactor]: 1.01,
    [Sensor.bias]: 0.1,
    [Sensor.noiseVariance]: 0
});

let actuator = new Actuator.Block({
    [Actuator.actuatorNaturalFrequency]: 80,
    [Actuator.actuatorDampingRatio]: 0.7,
}, {
    [Actuator.deflection]: 0,
    [Actuator.deflectionAngularVelocity]: 0
});

let controller = new Controller.Block({
    [Controller.controllerGain]: -1,
    [Controller.reference]: 0
});

let solver = new Solver([
    sensor,
    controller,
    actuator,
    plant,
], [
    {
        from: { block: plant, signal: Plant.angle },
        to: { block: sensor, signal: Sensor.angle }
    },
    {
        from: { block: sensor, signal: Sensor.measuredAngle },
        to: { block: controller, signal: Controller.measuredAngle }
    },
    {
        from: { block: controller, signal: Controller.commandedDeflection },
        to: { block: actuator, signal: Actuator.commandedDeflection }
    },
    {
        from: { block: actuator, signal: Actuator.deflection },
        to: { block: plant, signal: Plant.deflection }
    }
], 0.01);

let logger = new Logger();
let N = 1001;
for (let n = 0; n <= N; n++) {
    /* Calculate the output of all blocks for the current time step */
    solver.solve();

    logger.log(solver.time, [
        actuator.state,
        plant.state,
        actuator._solver.output,
        plant._solver.output,
        sensor._solver.output,
        controller._solver.output,
    ]);

    /* Prepare for next time step */
    solver.update();
}