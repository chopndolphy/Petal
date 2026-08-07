import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./ui/utility.js"

import { drawFeedback, drawDial } from './drawings.js';

export class IOEditor extends LitElement {
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
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: left; padding: 0px">
            <div style="display: flex; flex-direction: row; justify-content: center; align-items: left">
                <p>Input</p>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
            </div>
            <petal-slider juceID="reverbSize" style="--slider-width: 300px; --slider-height: 50px" .drawing=${drawFeedback}></petal-slider>

            <div style="display: flex; flex-direction: row; justify-content: center; align-items: left">
                <p>Feedback</p>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
                <p>Size</p>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
            </div>
            <petal-slider juceID="reverbSize" style="--slider-width: 300px; --slider-height: 50px" .drawing=${drawFeedback}></petal-slider>

            <div style="display: flex; flex-direction: row; justify-content: center; align-items: left">
                <p>Delay Level</p>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
            </div>
            <petal-slider juceID="reverbSize" style="--slider-width: 300px; --slider-height: 50px" .drawing=${drawFeedback}></petal-slider>

            <div style="display: flex; flex-direction: row; justify-content: center; align-items: left">
                <p>Reverb Level</p>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
            </div>
            <petal-slider juceID="reverbSize" style="--slider-width: 300px; --slider-height: 50px" .drawing=${drawFeedback}></petal-slider>

            <div style="display: flex; flex-direction: row; justify-content: center; align-items: left">
                <p>Dry Level</p>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
            </div>
            <petal-slider juceID="reverbSize" style="--slider-width: 300px; --slider-height: 50px" .drawing=${drawFeedback}></petal-slider>



            </div>
        </div>
        `
    }
};

customElements.define('io-editor', IOEditor);

