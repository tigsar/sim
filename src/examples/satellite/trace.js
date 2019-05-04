export default class Trace {
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