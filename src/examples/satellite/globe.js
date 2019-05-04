export default function buildGlobe(radius, nLat, nLon, material) {
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