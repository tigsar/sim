export default class ModelPropagator {
    constructor(model, initialState, timeStep) {
        this.model = model;
        this.time = 0;
        this.state = initialState;
        this.timeStep = timeStep;
    }
    step(input) {
        this.state = math.add(this.state, math.multiply(this.model.derivative(this.time, this.state, input), this.timeStep));
        this.time += this.timeStep;
    }
}