import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./delay_graphic.js"
import "./ui/utility.js"

import { drawLock, drawSkew, drawPosition } from './drawings.js';

// Labels correspond 1:1 (by index) to PetalProcessor::syncTimeOptions / the
// "syncTimeL"/"syncTimeR" AudioParameterChoice on the backend.
const SYNC_TIME_LABELS = [
    "8 Bars", "6 Bars", "4 Bars", "3 Bars", "2 Bars", "1 Bar",
    "1/2 Dotted", "1/2", "1/4 Dotted", "1/2 Triplet", "5/4",
    "1/4", "1/8 Dotted", "1/4 Triplet", "1/8", "1/8 Triplet",
    "1/16", "1/16 Triplet", "1/32"
];

export class DelayEditor extends LitElement {
    static properties = {
        isSyncL: { type: Boolean },
        isSyncR: { type: Boolean }
    }

    constructor() {
        super();
        this.isSyncL = true;
        this.isSyncR = true;
    }
    static styles = css`
        *, *::before, *::after {
            box-sizing: border-box;
        }

        p {
            margin: 0;
            font-size: 14px;
            font-family: Verdana;
            color: #696969;
        }
        `

    constructor(){
        super();
    }

    render()
    {
        return html`
        <div style="display: flex; flex-direction: column; justify-content: center; padding: 0px; width: 450px; height: 450px">

            <div style="display: flex; flex-direction: row; justify-content: center">
                <div style="display: flex; flex-direction: column; align-items: flex-start">
                    <petal-slider juceID="freeTimeL" suffix=" ms" style="--numbox-width: 175px; --numbox-height: 31px; --numbox-font-size: 30px; --numbox-color: white; --numbox-align: left"></petal-slider>
                    <petal-button onLabel="Free", offLabel="Sync" style="--button-align: left"></petal-button>
                </div>

                <petal-button style="--button-width: 30px; --button-height: 30px" .drawing=${drawLock}></petal-button>

                <div style="display: flex; flex-direction: column; align-items: flex-end">
                    <petal-slider juceID="freeTimeR" suffix=" ms" style="--numbox-width: 175px; --numbox-height: 31px; --numbox-font-size: 30px; --numbox-color: white; --numbox-align: right"></petal-slider>
                    <petal-button onLabel="Free", offLabel="Sync" style="--button-align: right"></petal-button>
                </div>
            </div>

            
            <div style="display: flex; flex-direction: column; align-items: center">
                <delay-graphic style="width: 320px; height: 320px"></delay-graphic>
            </div>

            <div style="display: flex; flex-direction: row; justify-content: center; justify-content: space-around">
                    <div style="display: flex; flex-direction: column; align-items: center">
                            <p>Position</p>
                            <petal-slider juceID="positionL" suffix=" %" style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center"></petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                            <p>Skew</p>
                            <petal-slider juceID="skewL" suffix=" %" style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center"></petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                        <p>Round</p>
                        <petal-slider juceID="skewR" suffix=" %" style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center"></petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                            <p>Skew</p>
                            <petal-slider juceID="skewR" suffix=" %" style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center"></petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                            <p>Position</p>
                            <petal-slider juceID="positionR" suffix=" %" style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center"></petal-slider>
                    </div>
                </div>
            </div>
        </div>
        `
    }
};

customElements.define('delay-editor', DelayEditor);
