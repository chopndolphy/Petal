import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/numbox.js"
import "./ui/button.js"
import "./reverb_graphics.js"
import { drawReverbSend } from './drawings.js';

export class ReverbEditor extends LitElement {

    constructor(){
        super();
    }
    render()
    {
        return html`

        <div style="display: flex; flex-direction: column; justify-content: center; padding: 10px; width: 450px">
            <reverb-graphic></reverb-graphic>
            

            <div style="display: flex; flex-direction: row>
                <div style="display: flex; flex-direction: column>
                    <graphic-slider style="--canvas-width: 200px; --canvas-height: 100px" ></graphic-slider>
                    <number-slider suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></number-slider>
                </div>

                <div style="display: flex; flex-direction: column>
                    <graphic-slider style="--canvas-width: 200px; --canvas-height: 100px" ></graphic-slider>
                    <number-slider suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></number-slider>
                </div>
            </div>

        </div>

        `
    }
};

customElements.define('reverb-editor', ReverbEditor);
