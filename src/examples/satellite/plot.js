import { DirectBlock } from '../../blocks/base.js';

export const xvar = Symbol('xvar');
export const yvar = Symbol('yvar');

export class Block extends DirectBlock {
    constructor(name, title, xTitle, xRange, yRange, convert, container) {
        super(
            name,
            [ xvar, yvar ], /* Input signals */
            [ ], /* Output signals */
            [ ], /* Parameter signals */
            { }
        );
        let data = [{
            x: [],
            y: [],
            mode: 'lines'
        }];
        var layout = {
            title: title,
            xaxis: {
                title: xTitle,
                range: xRange
            },
            yaxis: {
                range: yRange
            }
        };
        this.container = container;
        this.convert = convert;
        Plotly.plot(container, data, layout);
    }

    output(input) {
        this.checkInput(input);
        let values = this.convert(input[xvar], input[yvar]);
        Plotly.extendTraces(this.container, {
            x: [[values[0]]],
            y: [[values[1]]]
        }, [0]);
        return { }; 
    }
}