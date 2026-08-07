import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./delay_graphic.js"
import "./ui/utility.js"

import { drawLock, drawSkew, drawPosition } from './drawings.js';

const SYNC_TIME_LABELS = [
    "1/32", "3/64", "1/16", "3/32", "1/8", "3/16",
    "1/4", "3/8", "1/2", "3/4", "1"
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

    render()
    {
        return html`
        <div style="display: flex; flex-direction: column; justify-content: center; padding: 0px; width: 450px; height: 450px">

            <div style="display: flex; flex-direction: row; justify-content: center">
                <div style="display: flex; flex-direction: column; align-items: flex-start">
                    <div style="position: relative; width: 175px; height: 31px;">
                        <petal-slider juceID="freeTimeL" suffix=" ms" min="5" max="500" style="position: absolute; top: 0; left: 0; display: ${!this.isSyncL ? 'block' : 'none'}; --numbox-width: 175px; --numbox-height: 31px; --numbox-font-size: 30px; --numbox-color: white; --numbox-align: left"></petal-slider>
                        <petal-slider juceID="syncTimeL" mode="enum" .enumerators=${SYNC_TIME_LABELS} style="position: absolute; top: 0; left: 0; display: ${this.isSyncL ? 'block' : 'none'}; --numbox-width: 175px; --numbox-height: 31px; --numbox-font-size: 30px; --numbox-color: white; --numbox-align: left"></petal-slider>
                    </div>
                    <petal-button juceID="isSyncL" onLabel="Sync" offLabel="Free" style="--button-align: left" @change=${e => this.isSyncL = e.detail}></petal-button>
                </div>

                <petal-button juceID="stereoLock" style="--button-width: 30px; --button-height: 30px" .drawing=${drawLock}></petal-button>

                <div style="display: flex; flex-direction: column; align-items: flex-end">
                    <div style="position: relative; width: 175px; height: 31px;">
                        <petal-slider juceID="freeTimeR" exponent=4 suffix=" ms" min="5" max="500" style="position: absolute; top: 0; left: 0; display: ${!this.isSyncR ? 'block' : 'none'}; --numbox-width: 175px; --numbox-height: 31px; --numbox-font-size: 30px; --numbox-color: white; --numbox-align: right"></petal-slider>
                        <petal-slider juceID="syncTimeR" mode="enum" .enumerators=${SYNC_TIME_LABELS} style="position: absolute; top: 0; left: 0; display: ${this.isSyncR ? 'block' : 'none'}; --numbox-width: 175px; --numbox-height: 31px; --numbox-font-size: 30px; --numbox-color: white; --numbox-align: right"></petal-slider>
                    </div>
                    <petal-button juceID="isSyncR" onLabel="Sync" offLabel="Free" style="--button-align: right" @change=${e => this.isSyncR = e.detail}></petal-button>
                </div>
            </div>

            
            <div style="display: flex; flex-direction: column; align-items: center">
                <delay-graphic style="width: 320px; height: 320px"></delay-graphic>
            </div>

            <div style="display: flex; flex-direction: row; justify-content: center; justify-content: space-around">
                    <div style="display: flex; flex-direction: column; align-items: center">
                        <p>Position</p>
                        <petal-slider juceID="positionL" suffix=" %" 
                            style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center">
                        </petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                        <p>Skew</p>
                        <petal-slider juceID="skewL" suffix=" %" 
                            style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center">
                        </petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                        <p>Round</p>
                        <petal-slider juceID="skewR" suffix=" %" 
                            style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center">
                        </petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                            <p>Skew</p>
                            <petal-slider juceID="skewR" suffix=" %" 
                                style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center">
                            </petal-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center">
                            <p>Position</p>
                            <petal-slider juceID="positionR" suffix=" %" 
                            style="--numbox-width: 70px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-color: #909090; --numbox-align: center"></petal-slider>
                    </div>
                </div>
            </div>
        </div>
        `
    }
};

customElements.define('delay-editor', DelayEditor);
