import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./ui/utility.js"
import './preset_editor.js'
import { color } from './drawings.js';


import { drawFeedback, drawDial } from './drawings.js';

export class IOEditor extends LitElement {
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

    constructor(){
        super();
    }

    render()
    {
        return html`
        <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 20px">

                <!-- preset editors -->
                <preset-editor></preset-editor>

                <!-- controls -->


                <div>
                    <petal-slider juceID="inputLevel" style="--slider-width: 100%; --slider-height: 30px" .drawing=${drawFeedback}></petal-slider>
                    <div style="display: flex; flex-direction: row; justify-content: space-between; margin: 5px">
                        <label>Input</label>
                        <petal-slider juceID="inputLevel" suffix=" dB" min="-72" max="6" style=" --numbox-align: right"></petal-slider>
                    </div>
                </div>

                <div>
                    <petal-slider juceID="reverbSize" style="--slider-width: 100%; --slider-height: 30px" .drawing=${drawFeedback}></petal-slider>
                    <div style="display: flex; flex-direction: row; justify-content: space-between; margin: 5px">
                        <div style="display: flex; flex-direction: row; justify-content: space-between">
                        <label>Feedback</label>
                        <petal-slider juceID="reverbSize" suffix=" %" style=" --numbox-align: right"></petal-slider>
                        </div>

                        <div style="display: flex; flex-direction: row; justify-content: end">
                        <label>Size</label>
                        <petal-slider juceID="feedbackTap" suffix="" style=" --numbox-align: right"></petal-slider>
                        </div>
                    </div>
                </div>

                <div>
                    <petal-slider juceID="delayLevel" style="--slider-width: 100%; --slider-height: 30px" .drawing=${drawFeedback}></petal-slider>
                    <div style="display: flex; flex-direction: row; justify-content: space-between; margin: 5px">
                        <label>Delay Level</label>
                        <petal-slider juceID="delayLevel" suffix=" dB" min="-72" max="6" style=" --numbox-align: right"></petal-slider>
                    </div>
                </div>

                <div>
                    <petal-slider juceID="reverbLevel" style="--slider-width: 100%; --slider-height: 30px" .drawing=${drawFeedback}></petal-slider>
                    <div style="display: flex; flex-direction: row; justify-content: space-between; margin: 5px">
                        <label>Reverb Level</label>
                        <petal-slider juceID="reverbLevel" suffix=" dB" min="-72" max="6" style=" --numbox-align: right"></petal-slider>
                    </div>
                </div>

                <div>
                    <petal-slider juceID="dryLevel" suffix=" dB" min="-72" max="6" style=" --numbox-align: right"></petal-slider>
                    <div style="display: flex; flex-direction: row; justify-content: space-between; margin: 5px">
                        <label>Dry Level</label>
                        <petal-slider juceID="dryLevel" suffix=" %" style=" --numbox-align: right"></petal-slider>
                    </div>
                </div>

            </div>
        </div>
        `
    }
};

customElements.define('io-editor', IOEditor);

