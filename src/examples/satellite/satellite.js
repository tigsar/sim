import Trace from './trace.js'
import AttitudeDynamics from './attitude-dynamics.js'
import ModelPropagator from './model-propagator.js'
import buildGlobe from './globe.js'

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

let model = new AttitudeDynamics(80, 82, 4, 0.00104);
let prop = new ModelPropagator(model, [0, 0, Math.radians(5), 0, 0, 0], 10);
function animate() {
    requestAnimationFrame(animate);
    
    prop.step([0, 0, 0]);
    satellite.rotation.x = prop.state[0]; /* phi */
    satellite.rotation.y = prop.state[1]; /* theta */
    satellite.rotation.z = prop.state[2]; /* psi */
    
    renderer.render(scene, camera);
    zTrace.add(bodyAxes.localToWorld(new THREE.Vector3(0, 0, 6)));
    zTrace.update();

    addData(prop.time, Math.degrees(prop.state[0]));
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