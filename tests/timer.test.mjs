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
