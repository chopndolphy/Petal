import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/numbox.js"
import "./ui/button.js"
import "./delay_graphic.js"

import { drawLock } from './drawings.js';

export class DelayEditor extends LitElement {

    constructor(){
        super();
    }
    render()
    {
        return html`

        <div style="display: flex; flex-direction: column; justify-content: center; padding: 10px; width: 450px">

            <div style="display: flex; flex-direction: row; justify-content: center">
                <div style="display: flex; flex-direction: column; align-items: left">
                    <number-slider juceID="freeTimeL" suffix=" ms" style="--numbox-width: 200px; --numbox-font-size: 30px; --numbox-color: #96834A; --numbox-align: left"></number-slider>
                    <petal-button onLabel="Free", offLabel="Sync" style="--button-align: left"></petal-button>
                </div>

                <petal-button style="--button-width: 30px; --button-height: 30px" .drawing=${drawLock}></petal-button>

                <div style="display: flex; flex-direction: column; align-items: right">
                    <number-slider juceID="freeTimeR" suffix=" ms" style="--numbox-width: 200px; --numbox-font-size: 30px; --numbox-color: #96834A; --numbox-align: right"></number-slider>
                    <petal-button onLabel="Free", offLabel="Sync" style="--button-align: right"></petal-button>
                </div>
            </div>

            <div style="display: flex; flex-direction: row; justify-content: center">
                <delay-graphic width=300 height=400></delay-graphic>
            </div>

            <div style="display: flex; flex-direction: column">
                <div style="display: flex; flex-direction: row; justify-content: space-between">
                    <div style="display: flex; flex-direction: column;">
                        <number-slider juceID="skewL" suffix=" A"></number-slider>
                        <number-slider juceID="skewR" suffix=" B"></number-slider>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: right">
                        <number-slider juceID="positionL" suffix=" A"></number-slider>
                        <number-slider juceID="positionR" suffix=" B"></number-slider>
                    </div>

                </div>
            </div>
        </div>

        `
    }
};

customElements.define('delay-editor', DelayEditor);
