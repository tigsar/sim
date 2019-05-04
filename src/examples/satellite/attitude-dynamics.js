import {StateSpaceBlock} from '../../blocks/base.js'

/* Definition of input signals */
export const tdx = Symbol('Tdx');
export const tdy = Symbol('Tdy');
export const tdz = Symbol('Tdz');

/* Definition of output and state signals (including its derivatives) */
export const phi = Symbol('phi');
export const theta = Symbol('theta');
export const psi = Symbol('psi');
export const phiD = Symbol('phiD');
export const thetaD = Symbol('thetaD');
export const psiD = Symbol('psiD');
export const phiDD = Symbol('phiDD');
export const thetaDD = Symbol('thetaDD');
export const psiDD = Symbol('psiDD');

/* Definition of parameter signals */
export const ix = Symbol('Ix');
export const iy = Symbol('Iy');
export const iz = Symbol('Iz');
export const omega0 = Symbol('omega0');

export class Block extends StateSpaceBlock {
    constructor(parameter, initialCondition) {
        super(
            "Plant",
            [ tdx, tdy, tdz ], /* Input signals */
            [ phi, theta, psi, phiD, thetaD, psiD ], /* Output signals */
            [ phi, theta, psi, phiD, thetaD, psiD ], /* State signals */
            [ ix, iy, iz, omega0 ], /* Parameter signals */
            parameter,
            initialCondition, {
                [phi]: phiD,
                [theta]: thetaD,
                [psi]: psiD,
                [phiD]: phiDD,
                [thetaD]: thetaDD,
                [psiD]: psiDD,
            },
            false
        );
    }

    derivative(input) {
        this.checkInput(input);
        let tdx_ = input[tdx], tdy_ = input[tdy], tdz_ = input[tdz];
        let ix_ = this.parameter[ix], iy_ = this.parameter[iy], iz_ = this.parameter[iz], omega0_ = this.parameter[omega0];
        return {
            [phiD]: this.state[phiD],
            [thetaD]: this.state[thetaD],
            [psiD]: this.state[psiD],
            [phiDD]: (tdx_ - 4 * Math.pow(omega0_, 2) * (iy_ - iz_) * this.state[phi] + omega0_ * (ix_ + iz_ - iy_) * this.state[psiD]) / ix_,
            [thetaDD]: (tdy_ - 3 * Math.pow(omega0_, 2) * (ix_ - iz_) * this.state[theta]) / iy_,
            [psiDD]: (tdz_ - Math.pow(omega0_, 2) * (iy_ - ix_) * this.state[psi] - omega0_ * (iz_ + ix_ - iy_) * this.state[phiD]) / iz_
        };
    }

    output() {
        return {
            [phi]: this.state[phi],
            [theta]: this.state[theta],
            [psi]: this.state[psi],
            [phiD]: this.state[phiD],
            [thetaD]: this.state[thetaD],
            [psiD]: this.state[psiD]
        };
    }
}