import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { drawButton } from './drawings.js';
import { getSliderState } from '../juce.js';
import "./ui/slider.js"
import "./ui/button.js"
import { drawReverbSend, drawPitch, drawTapState, drawSelectDelay, drawSelectReverb } from './drawings.js';

export class TapEditorInstance extends LitElement {
    static properties = {
        isLeftColm: { type: Boolean },
        isPitch: { type: Boolean },
        tapIndex: { type: Number },
        isState: { type: Boolean}
    }

    constructor(){
        super()
        this.isPitch = false;
        this.isLeftColm = true;
        this.isState = true;
    }

    static styles = css `
        *, *::before, *::after {
            box-sizing: border-box;
        }

        #tapInstance {
            height: 70px;
            overflow: hidden;
            transition: height 0.5s
        }

        p {
            font-size: 14px;
            font-family: Verdana;
            color: #696969;
        }
    `
    firstUpdated() {
        this.tapStateSlider = getSliderState(`tapState${this.tapIndex}`);
        this.onStateChange = () => {
            this.isState = this.tapStateSlider.getNormalisedValue() >= 0.5;
        };
        this.onStateChange();
        this.tapStateSlider.valueChangedEvent.addListener(this.onStateChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    render(){
        return html`
        <div id="tapInstance" style="display: flex; flex-direction: row">
            <petal-button id="leftSide" juceID="tapState${this.tapIndex}" 
                style="display: ${this.isLeftColm ? "block" : "none"}; 
                --button-width: 25px; 
                --button-height: 50px; 
                margin-right: 5px" 
                .drawing=${drawTapState}>
            </petal-button>
            
            <p id="leftSide" style="display: ${!this.isLeftColm ? "block" : "none"}">${this.tapIndex + 1}</p>
            <div style="position: relative; width: 100px; height: 70px;">
                <div style="position: absolute; top: 0; left: 0; display: flex; flex-direction: column; visibility: ${this.isPitch ? 'visible' : 'hidden'}">
                    <petal-slider juceID="tapShiftAmt${this.tapIndex}" 
                        style="--slider-width: 100px; 
                        --slider-height: 50px; 
                        margin-bottom: 5px;" 
                        .drawing=${drawPitch}
                        .drawingAux=${ { tapIndex: this.tapIndex, state: this.isState }}>
                    </petal-slider>

                    <petal-slider juceID="tapShiftAmt${this.tapIndex}" 
                    suffix=" st" 
                    min="-12" 
                    max="12" 
                    style="--numbox-width: 100px; 
                    --numbox-height: 15px;
                    --numbox-font-size: 14px; 
                    --numbox-align: center">
                    </petal-slider>
                </div>

                <div style="position: absolute; top: 0; left: 0; display: flex; flex-direction: column; visibility: ${!this.isPitch ? 'visible' : 'hidden'}">
                    <petal-slider juceID="tapReverbAmt${this.tapIndex}"
                        style="--slider-width: 100px;
                        --slider-height: 50px;
                        margin-bottom: 5px;"
                        .drawing=${drawReverbSend}
                        .drawingAux=${ { tapIndex: this.tapIndex, state: this.isState }}>
                    </petal-slider>

                    <petal-slider juceID="tapReverbAmt${this.tapIndex}" 
                        suffix=" %" 
                        style="--numbox-width: 100px; 
                        --numbox-height: 15px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: center">
                    </petal-slider>

                </div>
            </div>
            <p id="leftSide" style="display: ${this.isLeftColm ? "block" : "none"}">${this.tapIndex + 1}</p>

            <petal-button id="leftSide" 
                juceID="tapState${this.tapIndex}" 
                style="display: ${!this.isLeftColm ? "block" : "none"}; 
                --button-width: 25px; 
                --button-height: 50px; 
                margin-right: 5px" 
                .drawing=${drawTapState}>
            </petal-button>
        </div>
        `
    }
}

customElements.define("tap-instance", TapEditorInstance)

export class TapEditor extends LitElement {
    static properties = {
        isPitch: { type: Boolean }
    }
    
    static styles = css`
        

        p {
            font-size: 14px;
            font-family: Verdana;
            color: #696969;
            margin: 0px;
        }
    `

    constructor() {
        super()
        this.isPitch = true;
    }

    render() {
        const instances = []            
        
        return html`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between">
                    <p>Ducking</p>
                    <petal-slider juceID="reverbDecayTime" 
                        suffix=" %" 
                        style="--numbox-width: 100px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: left">
                    </petal-slider>

                    <p>Release</p>
                    <petal-slider juceID="reverbDecayTime" 
                        suffix=" %" 
                        style="--numbox-width: 100px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: left">
                    </petal-slider>
                </div>

                <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between">
                    <p>Window Size</p>
                    <petal-slider juceID="windowSize" 
                        suffix=" ms" 
                        style="--numbox-width: 100px; 
                        --numbox-font-size: 14px; 
                        --numbox-align: left">
                    </petal-slider>
                </div>

                <div style="display: flex; flex-direction: row; justify-content: space-between; gap: 25px">
                    
                    <div style="display: flex; flex-direction: column; gap: 25px">
                        <tap-instance .isPitch=${this.isPitch} tapIndex=0></tap-instance>
                        <tap-instance .isPitch=${this.isPitch} tapIndex=2></tap-instance>
                        <tap-instance .isPitch=${this.isPitch} tapIndex=4></tap-instance>
                        <tap-instance .isPitch=${this.isPitch} tapIndex=6></tap-instance>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 25px">
                        <tap-instance .isLeftColm=${false} .isPitch=${this.isPitch} tapIndex=1></tap-instance>
                        <tap-instance .isLeftColm=${false} .isPitch=${this.isPitch} tapIndex=3></tap-instance>
                        <tap-instance .isLeftColm=${false} .isPitch=${this.isPitch} tapIndex=5></tap-instance>
                        <tap-instance .isLeftColm=${false} .isPitch=${this.isPitch} tapIndex=7></tap-instance>
                    </div>
                </div>
            </div>
        `
    }
}

customElements.define("tap-editor", TapEditor)
