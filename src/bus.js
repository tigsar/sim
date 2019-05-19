export function isInBus(bus, signal) {
    if (!bus || !(signal in bus))
        return false;
    return true;
}

export function sumBus(buses) {
    let out = {};
    for (let bus of buses) {
        for (let signal of Object.getOwnPropertySymbols(bus)) {
            out[signal] = out[signal] || 0;
            out[signal] = out[signal] + bus[signal];
        }
    }

    return out;
}

export function scaleBus(bus, scale) {
    let out = {};
    for (let signal of Object.getOwnPropertySymbols(bus)) {
        out[signal] = bus[signal] * scale;
    }
    return out;
}