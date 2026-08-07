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
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0px; width: 100px; height: 450px">
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center">
                <p>Feedback</p>
                <petal-slider juceID="reverbSize" style="--slider-width: 80px; --slider-height: 175px" .drawing=${drawFeedback}></petal-slider>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
                <p>Tap Size</p>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>

                <p>Input</p>
                <petal-slider juceID="reverbSize" style="--slider-width: 80px; --slider-height: 80px" .drawing=${drawDial}></petal-slider>
                <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
            </div>
        </div>
        `
    }
};

customElements.define('io-editor', IOEditor);

