import {sumBus, scaleBus} from './bus.js'

test('should sum bus signals', () => {
    const a = Symbol('a');
    const b = Symbol('b');
    const c = Symbol('c');
    const bus1 = {
        [a]: 1,
        [b]: 12,
        [c]: 1.1
    };
    const bus2 = {
        [a]: 3,
        [b]: 8,
        [c]: 0.9 
    };
    const bus3 = {
        [a]: 10,
        [b]: 20,
        [c]: 0
    };
    const sum = sumBus([bus1, bus2, bus3]);
    expect(sum[a]).toBe(14);
    expect(sum[b]).toBe(40);
    expect(sum[c]).toBe(2.0);
});

test('should scale bus signals', () => {
    const a = Symbol('a');
    const b = Symbol('b');
    const c = Symbol('c');
    const d = Symbol('d');
    const bus = {
        [a]: 1,
        [b]: 12,
        [c]: -1.2,
        [d]: 0,
    };
    let sbus = scaleBus(bus, 1);
    expect(sbus[a]).toBe(1);
    expect(sbus[b]).toBe(12);
    expect(sbus[c]).toBe(-1.2);
    expect(sbus[d]).toBe(0);

    sbus = scaleBus(bus, 10);
    expect(sbus[a]).toBe(10);
    expect(sbus[b]).toBe(120);
    expect(sbus[c]).toBe(-12);
    expect(sbus[d]).toBe(0);

    sbus = scaleBus(bus, -1);
    expect(sbus[a]).toBe(-1);
    expect(sbus[b]).toBe(-12);
    expect(sbus[c]).toBe(1.2);
    expect(sbus[d]).toBe(-0);

    sbus = scaleBus(bus, 0);
    expect(sbus[a]).toBe(0);
    expect(sbus[b]).toBe(0);
    expect(sbus[c]).toBe(-0);
    expect(sbus[d]).toBe(0);
});