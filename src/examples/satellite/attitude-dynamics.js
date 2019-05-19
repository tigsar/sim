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

    derivative(state, input) {
        this.checkInput(input);
        this.checkState(state);
        let tdx_ = input[tdx], tdy_ = input[tdy], tdz_ = input[tdz];
        let ix_ = this.parameter[ix], iy_ = this.parameter[iy], iz_ = this.parameter[iz], omega0_ = this.parameter[omega0];
        return {
            [phiD]: state[phiD],
            [thetaD]: state[thetaD],
            [psiD]: state[psiD],
            [phiDD]: (tdx_ - 4 * Math.pow(omega0_, 2) * (iy_ - iz_) * state[phi] + omega0_ * (ix_ + iz_ - iy_) * state[psiD]) / ix_,
            [thetaDD]: (tdy_ - 3 * Math.pow(omega0_, 2) * (ix_ - iz_) * state[theta]) / iy_,
            [psiDD]: (tdz_ - Math.pow(omega0_, 2) * (iy_ - ix_) * state[psi] - omega0_ * (iz_ + ix_ - iy_) * state[phiD]) / iz_
        };
    }

    output(state) {
        this.checkState(state);
        return {
            [phi]: state[phi],
            [theta]: state[theta],
            [psi]: state[psi],
            [phiD]: state[phiD],
            [thetaD]: state[thetaD],
            [psiD]: state[psiD]
        };
    }
}