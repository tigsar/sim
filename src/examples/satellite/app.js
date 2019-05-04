import Trace from './trace.js'
import * as SatelliteModel from './attitude-dynamics.js'
import buildGlobe from './globe.js'
import {Solver} from '../../solver.js';

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
var index = 0;
var nbPoints = 0;


let model = new SatelliteModel.Block({
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

let solver = new Solver([ model ], [ ], 10);

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

    addData(solver.time, Math.degrees(model._solver.output[SatelliteModel.phi]));
}

let data = [{
    x: [],
    y: [],
    mode: 'lines'
}];
var layout = {
    title: 'Phi [deg]',
    xaxis: {
        title: 'Time [s]',
        range: [0, 15000]
    },
    yaxis: {range: [-0.04, 0.04]}
};
Plotly.plot('right-container', data, layout);

function addData(x, y) {
    Plotly.extendTraces('right-container', {
        x: [[x]],
        y: [[y]]
    }, [0]);
}

if (WEBGL.isWebGLAvailable()) {
    animate();
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.getElementById('left-container').appendChild(warning);
}