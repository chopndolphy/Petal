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

        label {
            margin: 0;
            font-size: 14px;
            font-family: Verdana;
            color: #696969;
        }
        `

    render() {
        return html`
    <div style="padding: 25px; display: flex; flex-direction: column; justify-content: space-between; width: 450px; height: 450px">

        <!-- top menu items -->
        <div style="display: flex; flex-direction: row; justify-content: space-between">
            <!-- left delay -->
            <div style="display: flex; flex-direction: column">
                <div style="height: 30px;">
                    <petal-slider juceID="freeTimeL"
                        suffix=" ms"
                        min="5" max="500"
                        style="
                            display: ${!this.isSyncL ? 'block' : 'none'}; 
                            --numbox-width: 150px; 
                            --numbox-height: 31px; 
                            --numbox-font-size: 30px; 
                            --numbox-color: white; 
                            --numbox-align: left">
                    </petal-slider>
                    <petal-slider juceID="syncTimeL" 
                        mode="enum" .enumerators=${SYNC_TIME_LABELS} 
                        style=" 
                            display: ${this.isSyncL ? 'block' : 'none'}; 
                            --numbox-width: 150px; 
                            --numbox-height: 31px; 
                            --numbox-font-size: 30px; 
                            --numbox-color: white; 
                            --numbox-align: left">
                    </petal-slider>
                </div>
                <petal-button juceID="isSyncL" onLabel="Sync" offLabel="Free" 
                    style="--button-width: 50px; --button-align: left" 
                    @change=${e => this.isSyncL = e.detail}>
                </petal-button>
            </div>

            <petal-button juceID="stereoLock" style="--button-width: 30px; --button-height: 30px" .drawing=${drawLock}></petal-button>

            <!-- right delay -->
            <div style="display: flex; flex-direction: column; align-items: flex-end">
                <div style=" height: 30px;">
                    <petal-slider juceID="freeTimeR"
                        suffix=" ms"
                        min="5" max="500"
                        style=" display: ${!this.isSyncR ? 'block' : 'none'}; 
                            --numbox-width: 150px; 
                            --numbox-height: 31px; 
                            --numbox-font-size: 30px; 
                            --numbox-color: white; 
                            --numbox-align: right;
                            --text-align: right">
                    </petal-slider>
                    <petal-slider juceID="syncTimeR" 
                        mode="enum" .enumerators=${SYNC_TIME_LABELS} 
                        style=" display: ${this.isSyncR ? 'block' : 'none'}; 
                            --numbox-width: 150px; 
                            --numbox-height: 31px; 
                            --numbox-font-size: 30px; 
                            --numbox-color: white; 
                            --numbox-align: right;
                            --text-align: right">
                    </petal-slider>
                </div>
                <petal-button juceID="isSyncR" onLabel="Sync" offLabel="Free" 
                    style="--button-width: 50px; --button-align: right" 
                    @change=${e => this.isSyncR = e.detail}>
                </petal-button>
            </div>
        </div>

        <!-- visualizer -->
        <div style="display: flex; flex-direction: column; align-items: center">
            <delay-graphic style="width: 300px; height: 300px"></delay-graphic>
        </div>

        <!-- bottom controls -->
        <div style="display: flex; flex-direction: row; justify-content: space-around">
            <div style="display: flex; flex-direction: column; align-items: center">
                <label>Position</label>
                <petal-slider juceID="positionL" suffix=" %" 
                    style="--numbox-align: center"></petal-slider>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center">
                <label>Skew</label>
                <petal-slider juceID="skewL" min="-100" max="100" suffix=" %" 
                    style="--numbox-align: center"></petal-slider>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center">
                <label>Round</label>
                <petal-slider juceID="round" suffix=" %" 
                    style="--numbox-align: center"></petal-slider>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center">
                <label>Skew</label>
                <petal-slider juceID="skewR" min="-100" max="100" suffix=" %" 
                    style="--numbox-align: center"></petal-slider>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center">
                <label>Position</label>
                <petal-slider juceID="positionR" suffix=" %" 
                    style="--numbox-align: center"></petal-slider>
            </div>
        </div>
    </div>
    `
    }
};

customElements.define('delay-editor', DelayEditor);
