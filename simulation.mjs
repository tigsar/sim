class MissingSignal extends Error {};
class MissingDerivative extends Error {};
class NotSupportedBlockType extends Error {};
class PressenceOfAlgebraicLoop extends Error {};

class CommonBlock {
    constructor(name, inputSignals, outputSignals, parameterSignals, parameter) {
        this.name = name;
        this.parameterSignals = parameterSignals;
        this.checkParameter(parameter);
        this.parameter = parameter;
        this.inputSignals = inputSignals;
        this.outputSignals = outputSignals;
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

export class DynamicBlock extends CommonBlock {
    constructor(name, inputSignals, outputSignals, stateSignals, parameterSignals, parameter, initialCondition, derivativesDef) {
        super(name, inputSignals, outputSignals, parameterSignals, parameter);
        this.stateSignals = stateSignals;
        this.checkState(initialCondition);
        this.state = initialCondition;
        this.derivativesDef = derivativesDef;
        this.time = 0;
    }

    checkState(state) {
        for (let signal of this.stateSignals) {
            checkSignal(state, signal);
        }
    }
}

export function checkSignal(bus, signal) {
    if (!bus || !(signal in bus))
        throw new MissingSignal(`${signal.toString()} is not found in the bus`);
}

export class Solver {
    constructor(blocks, links, dt) {
        this.blocks = blocks;
        this.links = links;
        this.dt = dt;
        this.time = 0;
        this.blocks = this._resolveOrder();
        this._checkAlgebraicLoops();
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

    update() {
        /* For blocks with an internal dynamic state, update the internal state (prepare for the next iteration) */
        for (let block of this.blocks) {
            if (block instanceof DynamicBlock) {
                this._integrate(block);
            }
        }
        this.time += this.dt;
    }

    _integrate(block) {
        let input = block._solver.input;
        let derivative = block.derivative(input);
        for (let signal of Object.getOwnPropertySymbols(block.state)) { /* Iterate all signal of the state */
            let derivativeOf = block.derivativesDef;
            if (signal in derivativeOf) {
                block.state[signal] += derivative[derivativeOf[signal]] * this.dt;
            } else {
                throw new MissingDerivative(`Cannot find the derivative of ${signal.toString()}`);
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

    _getDependencies(block) {
        let dependencies = [];
        for (let link of this.links) {
            if (link.to.block == block) {
                if (!(link.from.block in dependencies)) {
                    dependencies.push(link.from.block);
                }
            }
        }
        return dependencies;
    }

    _getDependents(block) {
        let dependents = [];
        for (let link of this.links) {
            if (link.from.block == block) {
                if (!(link.to.block in dependents)) {
                    dependents.push(link.to.block);
                }
            }
        }
        return dependents;
    }
    
    _checkAlgebraicLoops() {
        /* Calculate the dependencies and dependents */
        for (let block of this.blocks) {
            block._topology = block._topology || {};
            if (block instanceof DirectBlock) {
                block._topology.missingInputs = this._getDependencies(block);
            } else {
                block._topology.missingInputs = [];
            }
            block._topology.dependents = this._getDependents(block);
        }

        /* Check there is no algebraic loops in the topology */
        for (let block of this.blocks) {
            if (block._topology.missingInputs.length > 0) {
                throw new PressenceOfAlgebraicLoop(`Cannot compute the output of ${block} because ${block._topology.missingInput} shall be calculated first`);
            }
            
            /* Updated the list of missing inputs for each dependent block */
            for (let dependent of block._topology.dependents) {
                dependent._topology.missingInputs = dependent._topology.missingInputs.filter(item => item != block);
            }
        }
    }

    _resolveOrder() {
        let toBeProcessed = this.blocks.slice();
        let toBeProcessedLength = toBeProcessed.length;
        let counter = 0;
        let solution = [];

        /* Calculate the dependencies and dependents */
        for (let block of this.blocks) {
            block._topology = block._topology || {};
            if (block instanceof DirectBlock) {
                block._topology.missingInputs = this._getDependencies(block);
            } else {
                block._topology.missingInputs = [];
            }
            block._topology.dependents = this._getDependents(block);
        }
        
        while (toBeProcessed.length > 0) {
            /* Pop the first item from the list of blocks to be processed */
            let block = toBeProcessed[0];
            toBeProcessed = toBeProcessed.filter(item => item != block);

            /* Check whether the block is solvable or not */
            if (block._topology.missingInputs.length == 0) {
                /* The block is solvable; add it to the solution. */
                solution.push(block);
                /* Updated the list of missing inputs for each dependent block */
                for (let dependent of block._topology.dependents) {
                    dependent._topology.missingInputs = dependent._topology.missingInputs.filter(item => item != block);
                }
            } else {
                /* The block is not solvable; push it again to the list, as it shall be processed again */
                toBeProcessed.push(block);
            }

            counter++;
            
            if (counter % (2 * toBeProcessedLength) == 0) {
                if (toBeProcessedLength == toBeProcessed.length) {
                    throw new PressenceOfAlgebraicLoop(`Cannot compute the output of ${toBeProcessed}`);
                } else {
                    toBeProcessedLength = toBeProcessed.length;
                }
            }
        }
        return solution;
    }
}

export class Logger {
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