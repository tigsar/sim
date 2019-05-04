export default class AttitudeDynamics {
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