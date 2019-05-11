import * as SatelliteModel from './attitude-dynamics.js'
import * as Satellite3DModel from './model.js'
import * as Plot from './plot.js'
import {Solver} from '../../solver.js';
import * as Time from '../../blocks/time.js';

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

const model3D = new Satellite3DModel.Block(
    '3D satellite model',
    document.getElementById('left-container'));

const model = new SatelliteModel.Block({
    [SatelliteModel.ix]: 80,
    [SatelliteModel.iy]: 82,
    [SatelliteModel.iz]: 4,
    [SatelliteModel.omega0]: 0.00104,
}, {
    [SatelliteModel.phi]: 0,
    [SatelliteModel.theta]: 0,
    [SatelliteModel.psi]: Math.radians(5),
    [SatelliteModel.phiD]: 0,
    [SatelliteModel.thetaD]: 0,
    [SatelliteModel.psiD]: 0,
});

const time = new Time.Block("Time");

const plot = new Plot.Block(
    'Phi angle plot',
    'Phi [deg]',
    'Time [s]',
    [0, 15000],
    [-0.04, 0.04],
    (x, y) => [x, Math.degrees(y)],
    'right-container');

const solver = new Solver([ model, plot, time, model3D ], [ {
        from: { block: model, signal: SatelliteModel.phi },
        to: { block: plot, signal: Plot.yvar }
    }, {
        from: { block: time, signal: Time.output },
        to: { block: plot, signal: Plot.xvar }
    }, {
        from: { block: model, signal: SatelliteModel.phi },
        to: { block: model3D, signal: Satellite3DModel.xrot }
    }, {
        from: { block: model, signal: SatelliteModel.theta },
        to: { block: model3D, signal: Satellite3DModel.yrot }
    }, {
        from: { block: model, signal: SatelliteModel.psi },
        to: { block: model3D, signal: Satellite3DModel.zrot }
    }
], 10);

function animate() {
    requestAnimationFrame(animate);

    solver.solve();

    /* Force the input of the model */
    model._solver.input = {
        [SatelliteModel.tdx]: 0,
        [SatelliteModel.tdy]: 0,
        [SatelliteModel.tdz]: 0
    };

    solver.update();
}

if (WEBGL.isWebGLAvailable()) {
    animate();
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.getElementById('left-container').appendChild(warning);
}