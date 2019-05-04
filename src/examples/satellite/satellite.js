class Trace {
    constructor(maxPoints, material, scene) {
        this.MAX_POINTS = maxPoints;
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.MAX_POINTS * 3); // 3 vertices per point
        this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setDrawRange(0, 0);
        this.scene = scene;
        this.line = new THREE.Line(this.geometry, material);
        this.scene.add(this.line)
        this.index = 0;
        this.nbPoints = 0;
    }
    add({x, y, z}) {
        this.positions[this.index] = x;
        this.positions[this.index + 1] = y;
        this.positions[this.index + 2] = z;
        this.index += 3;
        this.nbPoints++;
        this.line.geometry.setDrawRange(0, this.nbPoints);
    }
    update() {
        this.line.geometry.attributes.position.needsUpdate = true; // required after the first render
    }
}
class AttitudeDynamics {
    constructor(ix, iy, iz, omega0) {
        this.ix = ix;
        this.iy = iy;
        this.iz = iz;
        this.omega0 = omega0;
    }
    derivative(time, [phi, theta, psi, phiD, thetaD, psiD], [tdx, tdy, tdz]) {
        return [
            phiD,
            thetaD,
            psiD,
            (tdx - 4 * Math.pow(this.omega0, 2) * (this.iy - this.iz) * phi + this.omega0 * (this.ix + this.iz - this.iy) * psiD) / this.ix,
            (tdy - 3 * Math.pow(this.omega0, 2) * (this.ix - this.iz) * theta) / this.iy,
            (tdz - Math.pow(this.omega0, 2) * (this.iy - this.ix) * psi - this.omega0 * (this.iz + this.ix - this.iy) * phiD) / this.iz,
        ];
    }
}
class ModelPropagator {
    constructor(model, initialState, timeStep) {
        this.model = model;
        this.time = 0;
        this.state = initialState;
        this.timeStep = timeStep;
    }
    step(input) {
        this.state = math.add(this.state, math.multiply(this.model.derivative(this.time, this.state, input), this.timeStep));
        this.time += this.timeStep;
    }
}
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

function buildGlobe(radius, nLat, nLon, material) {
    let LAT_STEP = 180.0 / nLat;
    let LON_STEP = 360.0 / nLon;
    console.log(LAT_STEP);
    console.log(LON_STEP);
    let globe = new THREE.Group();

    /* Add latitudes */
    for (let latitude = -90; latitude <= 90; latitude += LAT_STEP) {
        let latitudeLine = new THREE.Geometry();
        let z = radius * Math.sin(Math.radians(latitude));
        let rcos = radius * Math.cos(Math.radians(latitude));
        for (let longitude = 0; longitude <= 360; longitude += LON_STEP) {
            let x = rcos * Math.cos(Math.radians(longitude));
            let y = rcos * Math.sin(Math.radians(longitude));
            latitudeLine.vertices.push(new THREE.Vector3(x, y, z));
        }
        globe.add(new THREE.Line(latitudeLine, material));
    }

    /* Add longitudes */
    for (let longitude = 0; longitude <= 360; longitude += LON_STEP) {
        let longitudeLine = new THREE.Geometry();
        for (let latitude = -90; latitude <= 90; latitude += LAT_STEP) {
            let rcos = radius * Math.cos(Math.radians(latitude));
            let x = rcos * Math.cos(Math.radians(longitude));
            let y = rcos * Math.sin(Math.radians(longitude));
            let z = radius * Math.sin(Math.radians(latitude));
            longitudeLine.vertices.push(new THREE.Vector3(x, y, z));
        }
        globe.add(new THREE.Line(longitudeLine, material));
    }
    return globe;
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