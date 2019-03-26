import * as ZeroOrderHold from './blocks/zoh';
import {Solver} from './solver';

/**
 * Zero Order Hold (ZOH) is described as:
 * x{n+1} = u{n}
 * y{n+1} = x{n+1}
 * 
 * With zero initial condition: x{0} = 0, thus y{0} = 0 and u{0} is used for x{1} and y{1}
 */
test('Zero order holder', () => {
    const block = new ZeroOrderHold.Block("Zoh");
    const solver = new Solver([ block ], [ ], 0.125);

    /* n = 0: initial output */
    solver.solve(); /* y0 = x0 = 0 */
    block._solver.input = { [ZeroOrderHold.input]: 0 }; /* u0 */
    expect(block._solver.output[ZeroOrderHold.output]).toBe(0);

    /* n = 1: no change (holds the previous value) */
    solver.update(); /* x1 = u0 = 0 */
    solver.solve(); /* y1 = x1 = 0 */
    block._solver.input = { [ZeroOrderHold.input]: 0 }; /* u1 */
    expect(block._solver.output[ZeroOrderHold.output]).toBe(0);

    /* n = 2: no change (holds the previous value) */
    solver.update(); /* x2 = u1 = 0 */
    solver.solve(); /* y2 = x2 = 0 */
    block._solver.input = { [ZeroOrderHold.input]: 1 }; /* u2 */
    expect(block._solver.output[ZeroOrderHold.output]).toBe(0);

    /* n = 3: no change (holds the previous value) */
    solver.update(); /* x3 = u2 = 1 */
    solver.solve(); /* y3 = x3 = 1 */
    block._solver.input = { [ZeroOrderHold.input]: 2 }; /* u3 */
    expect(block._solver.output[ZeroOrderHold.output]).toBe(1);

    /* n = 4: input is changed */
    solver.update(); /* x4 = u3 = 2 */
    solver.solve(); /* y4 = x4 = 2 */
    block._solver.input = { [ZeroOrderHold.input]: -1.1 }; /* u4 */
    expect(block._solver.output[ZeroOrderHold.output]).toBe(2);

    /* n = 5: input is changed */
    solver.update(); /* x5 = u4 = -1.1 */
    solver.solve(); /* y5 = x5 = -1.1 */
    block._solver.input = { [ZeroOrderHold.input]: 0 }; /* u5 */
    expect(block._solver.output[ZeroOrderHold.output]).toBe(-1.1);
});