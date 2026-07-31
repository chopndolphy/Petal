import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { drawButton } from './drawings.js';
import "./ui/slider.js"
import "./ui/button.js"
import { drawReverbSend, drawPitch, drawTapState, drawSelectDelay, drawSelectReverb } from './drawings.js';

export class TapEditorInstance extends LitElement {
    static properties = {
        isPitch: { type: Boolean },
        tapIndex: { type: Number }
    }

    constructor(){
        super()
        this.isPitch = false;
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
    `

    render(){
        return html`
        <div id="tapInstance" style="display: flex; flex-direction: row">
            <petal-button juceID="tapState${this.tapIndex}" style="--button-width: 25px; --button-height: 50px; margin-right: 5px" .drawing=${drawTapState}></petal-button>
            <p>${this.tapIndex}</p>
            <div style="position: relative; width: 100px; height: 70px;">
                <div style="position: absolute; top: 0; left: 0; display: flex; flex-direction: column; visibility: ${this.isPitch ? 'visible' : 'hidden'}">
                    <petal-slider juceID="tapShiftAmt${this.tapIndex}" style="--slider-width: 100px; --slider-height: 50px; margin-bottom: 5px;" .drawing=${drawPitch}></petal-slider>
                    <petal-slider juceID="tapShiftAmt${this.tapIndex}" suffix=" st" min="-12" max="12" style="--numbox-width: 100px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
                </div>

                <div style="position: absolute; top: 0; left: 0; display: flex; flex-direction: column; visibility: ${!this.isPitch ? 'visible' : 'hidden'}">
                    <petal-slider juceID="tapReverbAmt${this.tapIndex}" style="--slider-width: 100px; --slider-height: 50px; margin-bottom: 5px;" .drawing=${drawReverbSend}></petal-slider>
                    <petal-slider juceID="tapReverbAmt${this.tapIndex}" suffix=" %" style="--numbox-width: 100px; --numbox-height: 15px; --numbox-font-size: 14px; --numbox-align: center"></petal-slider>
                </div>
            </div>
        </div>
        `
    }
}

customElements.define("tap-instance", TapEditorInstance)

export class TapEditor extends LitElement {
    static properties = {
        isPitch: { type: Boolean }
    }

    constructor() {
        super()
        this.isPitch = true;
    }

    render() {
        const instances = []            
        
        return html`

        <div style="display: flex; flex-direction: row; justify-content: space-evenly">
            <div style="display: flex; flex-direction: column; gap: 25px">
                <tap-instance .isPitch=${this.isPitch} tapIndex=0></tap-instance>
                <tap-instance .isPitch=${this.isPitch} tapIndex=1></tap-instance>
                <tap-instance .isPitch=${this.isPitch} tapIndex=2></tap-instance>
                <tap-instance .isPitch=${this.isPitch} tapIndex=3></tap-instance>
            </div>

            <div style="display: flex; flex-direction: column; gap: 25px">
                <tap-instance .isPitch=${this.isPitch} tapIndex=4></tap-instance>
                <tap-instance .isPitch=${this.isPitch} tapIndex=5></tap-instance>
                <tap-instance .isPitch=${this.isPitch} tapIndex=6></tap-instance>
                <tap-instance .isPitch=${this.isPitch} tapIndex=7></tap-instance>
            </div>

        </div>

        `
    }
}

customElements.define("tap-editor", TapEditor)
