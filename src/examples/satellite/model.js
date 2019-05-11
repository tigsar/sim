import {DirectBlock} from '../../blocks/base.js'
import buildGlobe from './globe.js'
import Trace from './trace.js'

/* Definition of input signals */
export const xrot = Symbol('rotation_x_axis');
export const yrot = Symbol('rotation_y_axis');
export const zrot = Symbol('rotation_z_axis');

export class Block extends DirectBlock {
    constructor(name, container) {
        super(
            name,
            [ xrot, yrot, zrot ], /* Input signals */
            [ ], /* Output signals */
            [ ], /* Parameter signals */
            { }
        );

        /* Camera */
        let camera = new THREE.PerspectiveCamera(
            45, /*  Field Of View (FOV) [deg] is the extent of the scene that is seen on the display at any given moment. */
            container.offsetWidth / container.offsetHeight, /* Aspect ratio */
            0.1, /* Near clipping plane */
            500); /* Far clipping plane */
        camera.position.set(0, 20, 20);
        camera.lookAt(0, 0, 0);

        /* Renderer */
        let renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(renderer.domElement);

        /* Geometries */
        let bodyG = new THREE.BoxGeometry(1, 1, 1);
        let pannelG = new THREE.BoxGeometry(2.5, 1, 0.1);

        /* Scene */
        let scene = new THREE.Scene();
        let green = new THREE.MeshBasicMaterial({color: 0x00ff00});
        let red = new THREE.MeshBasicMaterial({color: 0xff0000});

        /* Satellite */
        let body = new THREE.Mesh(bodyG, green);
        let leftPannel = new THREE.Mesh(pannelG, red);
        leftPannel.position.set(-2.5, 0, 0);
        let rightPannel = new THREE.Mesh(pannelG, red);
        rightPannel.position.set(2.5, 0, 0);
        let satellite = new THREE.Group();
        let bodyAxes = new THREE.AxesHelper(6); /* The X axis is red. The Y axis is green. The Z axis is blue. */
        satellite.add(body);
        satellite.add(leftPannel);
        satellite.add(rightPannel);
        satellite.add(bodyAxes);

        /* Inertial Frame */
        let inertialFrame = new THREE.Group();
        let inertialAxes = new THREE.AxesHelper(10); /* The X axis is red. The Y axis is green. The Z axis is blue. */
        inertialFrame.add(inertialAxes);

        /* Sphere */
        let material = new THREE.LineBasicMaterial({
            color: 0x202020,
        });
        inertialFrame.add(buildGlobe(6, 20, 20, material));

        /* Trace */
        let zTrace = new Trace(5000, new THREE.LineBasicMaterial({color: 0xFFFFFF}), scene);

        scene.add(inertialFrame);
        scene.add(satellite);

        this.renderer = renderer;
        this.zTrace = zTrace;
        this.scene = scene;
        this.camera = camera;
        this.bodyAxes = bodyAxes;
        this.satellite = satellite;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        this.zTrace.add(this.bodyAxes.localToWorld(new THREE.Vector3(0, 0, 6)));
        this.zTrace.update();
    }

    output(input) {
        this.checkInput(input);

        this.satellite.rotation.x = input[xrot];
        this.satellite.rotation.y = input[yrot];
        this.satellite.rotation.z = input[zrot];

        this.render();

        return { };
    }
}