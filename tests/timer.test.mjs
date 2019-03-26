import * as Timer from './blocks/timer';
import {Solver} from './solver';

const testTimer = (max, period, cycles) => {
    return () => {
        const timer = new Timer.Block("Timer", max);
        const solver = new Solver([ timer ], [ ], period);
    
        solver.solve();
    
        let counter = 0;
        for (let cycle = 1; cycle <= cycles; ++cycle) {
            for (let expectedOutput = 0; expectedOutput <= max; ++expectedOutput) {
                expect(timer._solver.output[Timer.output]).toBe(expectedOutput);
                expect(solver.counter).toBe(counter);
                solver.update();
                solver.solve();
                ++counter;
            }
        }
    };
};

test('Timer cycle with maximum=10', testTimer(10, 0.125, 100));
test('Timer cycle with maximum=1', testTimer(1, 0.1, 100));
test('Timer cycle with maximum=0', testTimer(0, 0.1, 100));
test('Timer cycle with maximum=1234', testTimer(1234, 0.125, 10));

/**
 * Timer is described as:
 * x{n+1} = (x{n} + 1) % (max + 1)
 * y{n+1} = x{n+1}
 * 
 * With zero initial condition: x{0} = 0, thus y{0} = 0
 */
test('Timer tick', () => {
    const block = new Timer.Block("Timer", 2);
    const solver = new Solver([ block ], [ ], 0.125);

    /* n = 0: initial output */
    solver.solve(); /* y0 = x0 = 0 */
    expect(block._solver.output[Timer.output]).toBe(0);

    /* n = 1 */
    solver.update(); /* x1 = x0 + 1 = 1 */
    solver.solve(); /* y1 = x1 = 1 */
    expect(block._solver.output[Timer.output]).toBe(1);

    /* n = 2 */
    solver.update(); /* x2 = x1 + 1 = 2 */
    solver.solve(); /* y2 = x2 = 2 */
    expect(block._solver.output[Timer.output]).toBe(2);

    /* n = 3 */
    solver.update(); /* x3 = x2 + 1 = 3 => 0 */
    solver.solve(); /* y3 = x3 = 0 */
    expect(block._solver.output[Timer.output]).toBe(0);

    /* n = 4 */
    solver.update(); /* x4 = x3 + 1 = 1 */
    solver.solve(); /* y4 = x4 = 1 */
    expect(block._solver.output[Timer.output]).toBe(1);
});