import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./reverb_graphics.js"
import { drawReverbSend, drawReverbSize, drawReverbDecay, drawReverbDampening, drawReverbTone } from './drawings.js';

export class ReverbEditor extends LitElement {
    static styles = css`
        *, *::before, *::after {
            box-sizing: border-box;
        }

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

    firstUpdated(){
        const canvas = this.renderRoot.querySelector('#reverbTone');
        drawReverbTone(canvas);
    }

    render(){
        return html`
        <div style="display: flex; flex-direction: column; justify-content: center; width: 450px">
            <reverb-graphic></reverb-graphic>
            
            <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 16px">
                <div style="display: flex; flex-direction: column; align-items: center">
                    <p>Size</p>
                    <petal-slider 
                        juceID="reverbDecayTime" 
                        style="--slider-width: 80px; 
                        --slider-height: 74px" 
                        .drawing=${drawReverbDecay}>
                    </petal-slider>

                    <petal-slider juceID="reverbDecayTime" 
                        suffix=" %" 
                        style="--numbox-width: 100px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: center">
                    </petal-slider>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center">
                    <p>Decay</p>
                    <petal-slider juceID="reverbSize" 
                        style="--slider-width: 80px; 
                        --slider-height: 74px" 
                        .drawing=${drawReverbSize}>
                    </petal-slider>

                    <petal-slider juceID="reverbSize" 
                        suffix=" %" 
                        style="--numbox-width: 100px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: center">
                    </petal-slider>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center">
                    <p>Tone</p>
                    <canvas id="reverbTone" 
                        style="width: 120px; height: 74px"
                        onload=${drawReverbTone}>
                    </canvas>
                    <div style="display: flex; flex-direction: row; align-items: center">

                    <petal-slider juceID="reverbDampening" 
                        suffix=" %" 
                        style="--numbox-width: 75px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: right">
                    </petal-slider>

                    <petal-slider juceID="reverbDampening" suffix=" %" 
                        style="--numbox-width: 75px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: left">
                    </petal-slider>

                    </div>
                </div>
            </div>

        </div>
        `
    }
};

customElements.define('reverb-editor', ReverbEditor);
