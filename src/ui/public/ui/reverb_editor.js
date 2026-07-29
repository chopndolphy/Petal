import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./reverb_graphics.js"
import { drawReverbSend, drawReverbSize, drawReverbDecay, drawReverbDampening } from './drawings.js';

export class ReverbEditor extends LitElement {
    static styles = css`
        p {
            margin: 0px;
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
        <div style="display: flex; flex-direction: column; justify-content: center; padding: 10px; width: 400px">
            <reverb-graphic></reverb-graphic>
            
            <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 16px">
                <div style="display: flex; flex-direction: column; align-items: center">
                    <p>Size</p>
                    <petal-slider juceID="reverbDecayTime" style="--slider-width: 80px; --slider-height: 74px" .drawing=${drawReverbSize}></petal-slider>
                    <petal-slider juceID="reverbDecayTime" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center">
                    <p>Decay</p>
                    <petal-slider juceID="reverbSize" style="--slider-width: 80px; --slider-height: 74px" .drawing=${drawReverbSize}></petal-slider>
                    <petal-slider juceID="reverbSize" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center">
                    <p>Dampening</p>
                    <petal-slider juceID="reverbDampening" style="--slider-width: 80px; --slider-height: 74px" .drawing=${drawReverbSize}></petal-slider>
                    <petal-slider juceID="reverbDampening" suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
                </div>
            </div>

        </div>

        `
    }
};

customElements.define('reverb-editor', ReverbEditor);
