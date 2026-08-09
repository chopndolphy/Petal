import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/slider.js"
import "./ui/button.js"
import "./reverb_graphics.js"
import { color } from './drawings.js';
import { getSliderState } from '../juce.js';
import { drawReverbSend, drawReverbSize, drawReverbDecay, drawReverbDampening, drawReverbTone } from './drawings.js';

export class ReverbEditor extends LitElement {
    static styles = css`
        *, *::before, *::after {
            box-sizing: border-box;
        }

        label {
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
        this.reverbLPF = getSliderState("reverbLPF");
        this.reverbHPF = getSliderState("reverbHPF");

        this.redrawTone = this.redrawTone.bind(this);

        this.canvas = this.renderRoot.querySelector('#reverbTone');
        this.resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = Math.round(width * dpr);
            this.canvas.height = Math.round(height * dpr);
            this.redrawTone();
        });
        this.resizeObserver.observe(this.canvas);

        this.reverbLPF.valueChangedEvent.addListener(this.redrawTone);
        this.reverbHPF.valueChangedEvent.addListener(this.redrawTone);
    }

    disconnectedCallback(){
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
    }

    redrawTone(){
        if (this.canvas){
            drawReverbTone(this.canvas,
                this.reverbLPF.getNormalisedValue(),
                this.reverbHPF.getNormalisedValue()
            );
        }
    }

    render(){
        return html`
        <div style="display: flex; flex-direction: column; justify-content: center; width: 450px">
            <reverb-graphic></reverb-graphic>
            
            <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 16px">
                <div style="display: flex; flex-direction: column; align-items: center">
                    <label>Decay</label>
                    <petal-slider 
                        juceID="reverbDecayTime" 
                        style="--slider-width: 80px; 
                        --slider-height: 74px" 
                        .drawing=${drawReverbDecay}>
                    </petal-slider>

                    <petal-slider juceID="reverbDecayTime" 
                        suffix=" %" 
                        style="--numbox-color:  ${ color.lightgrey }; 
                        --numbox-width: 100px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: center">
                    </petal-slider>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center">
                    <label>Size</label>
                    <petal-slider juceID="reverbSize" 
                        style="--slider-width: 80px; 
                        --slider-height: 74px" 
                        .drawing=${drawReverbSize}>
                    </petal-slider>

                    <petal-slider juceID="reverbSize" 
                        suffix=" %" 
                        style="--numbox-color: ${ color.lightgrey }; 
                        --numbox-width: 100px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: center">
                    </petal-slider>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center">
                    <label>Tone</label>
                    <canvas id="reverbTone"
                        style="width: 120px; height: 74px">
                    </canvas>
                    <div style="display: flex; flex-direction: row; align-items: center">

                    <petal-slider juceID="reverbLPF" suffix=" Hz" 
                        style="--numbox-color:  ${ color.lightgrey }; 
                        --numbox-width: 75px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: right">
                    </petal-slider>

                    <petal-slider juceID="reverbHPF" suffix=" Hz"
                        style="--numbox-color:  ${ color.lightgrey }; 
                        --numbox-width: 75px; 
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
