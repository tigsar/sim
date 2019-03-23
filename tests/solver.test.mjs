import * as Tf from './models/tf';
import {Solver, PressenceOfAlgebraicLoop} from './simulation';

const inputSignal = Symbol('Input signal');
const outputSignal = Symbol('Output signal');

test('Detection of algebraic loop', () => {
    let block = new Tf.Block("Test", inputSignal, outputSignal, [ 1, -1 ], [ 1 ]);
    expect(() => {
        new Solver([ block ], [{
            from: { block: block, signal: outputSignal },
            to: { block: block, signal: inputSignal }
        }], 0.125);
    }).toThrow(PressenceOfAlgebraicLoop);
});

test('No algebraic loop is detected for integrator with feedback', () => {
    let block = new Tf.Block("Test", inputSignal, outputSignal, [ 0, 1 ], [ 1 ]);
    expect(() => {
        new Solver([ block ], [{
            from: { block: block, signal: outputSignal },
            to: { block: block, signal: inputSignal }
        }], 0.125);
    }).not.toThrow(PressenceOfAlgebraicLoop);
});