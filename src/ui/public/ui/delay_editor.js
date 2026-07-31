import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./delay_graphic.js"
import "./ui/utility.js"

import { drawLock, drawSkew, drawPosition } from './drawings.js';

export class DelayEditor extends LitElement {
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
