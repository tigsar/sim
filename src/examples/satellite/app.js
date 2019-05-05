import Trace from './trace.js'
import * as SatelliteModel from './attitude-dynamics.js'
import * as Plot from './plot.js'
import buildGlobe from './globe.js'
import {Solver} from '../../solver.js';
import * as Time from '../../blocks/time.js';

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};
let leftContainer = document.getElementById('left-container');
/* Camera */
var camera = new THREE.PerspectiveCamera(
    45, /*  Field Of View (FOV) [deg] is the extent of the scene that is seen on the display at any given moment. */
    leftContainer.offsetWidth / leftContainer.offsetHeight, /* Aspect ratio */
    0.1, /* Near clipping plane */
    500); /* Far clipping plane */
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

/* Renderer */
var renderer = new THREE.WebGLRenderer();
renderer.setSize(leftContainer.offsetWidth, leftContainer.offsetHeight);
leftContainer.appendChild(renderer.domElement);

/* Geometries */
var bodyG = new THREE.BoxGeometry(1, 1, 1);
var pannelG = new THREE.BoxGeometry(2.5, 1, 0.1);

/* Scene */
var scene = new THREE.Scene();
var green = new THREE.MeshBasicMaterial({color: 0x00ff00});
var red = new THREE.MeshBasicMaterial({color: 0xff0000});

/* Satellite */
var body = new THREE.Mesh(bodyG, green);
var leftPannel = new THREE.Mesh(pannelG, red);
leftPannel.position.set(-2.5, 0, 0);
var rightPannel = new THREE.Mesh(pannelG, red);
rightPannel.position.set(2.5, 0, 0);
var satellite = new THREE.Group();
var bodyAxes = new THREE.AxesHelper(6); /* The X axis is red. The Y axis is green. The Z axis is blue. */
satellite.add(body);
satellite.add(leftPannel);
satellite.add(rightPannel);
satellite.add(bodyAxes);

/* Inertial Frame */
var inertialFrame = new THREE.Group();
var inertialAxes = new THREE.AxesHelper(10); /* The X axis is red. The Y axis is green. The Z axis is blue. */
inertialFrame.add(inertialAxes);

/* Sphere */
var material = new THREE.LineBasicMaterial({
    color: 0x202020,
});
inertialFrame.add(buildGlobe(6, 20, 20, material));

/* Trace */
let zTrace = new Trace(5000, new THREE.LineBasicMaterial({color: 0xFFFFFF}), scene);

scene.add(inertialFrame);
scene.add(satellite);

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

const solver = new Solver([ model, plot, time ], [ {
        from: { block: model, signal: SatelliteModel.phi },
        to: { block: plot, signal: Plot.yvar }
    }, {
        from: { block: time, signal: Time.output },
        to: { block: plot, signal: Plot.xvar }
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

    satellite.rotation.x = model._solver.output[SatelliteModel.phi];
    satellite.rotation.y = model._solver.output[SatelliteModel.theta];
    satellite.rotation.z = model._solver.output[SatelliteModel.psi];
    
    renderer.render(scene, camera);
    zTrace.add(bodyAxes.localToWorld(new THREE.Vector3(0, 0, 6)));
    zTrace.update();
}

if (WEBGL.isWebGLAvailable()) {
    animate();
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.getElementById('left-container').appendChild(warning);
}