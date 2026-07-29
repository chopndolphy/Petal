import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { drawButton } from './drawings.js';
import "./ui/slider.js"
import "./ui/button.js"
import { drawReverbSend, drawPitch, drawLock } from './drawings.js';

export class TapEditorInstance extends LitElement {
    static properties = {
        isPitch: { type: Boolean }
    }

    constructor(){
        super()
        this.isPitch = false;
    }

    static styles = css `
        #tapInstance {
            height: 40px;
            overflow: hidden;
            transition: height 0.5s
        }
            
    `

    render(){
        return html`
        <div id="tapInstance" style="display: flex; flex-direction: row; margin: 5px 10px">
            <petal-button style="--button-width: 10px; --button-height: 40px" .drawing=${drawButton}></petal-button>

            <div style="display: flex; flex-direction: column;">
                <petal-slider style="--slider-width: 80px; --slider-height: 40px;" .drawing=${drawPitch}  is-resized-on-selection></petal-slider>
                <petal-slider suffix=" %" style="--numbox-width: 80px; --numbox-height: 20px; --numbox-font-size: 12px; --numbox-align: center"></petal-slider>

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
        <div style="padding-top: 150px; padding-bottom: 100px">
            <div style="display: flex; flex-direction: row; ">
                <tap-instance></tap-instance>
                <tap-instance></tap-instance>
                <tap-instance></tap-instance>
                <tap-instance></tap-instance>
            </div>
                <div style="display: flex; flex-direction: row; padding-top: 20px;">
                <tap-instance></tap-instance>
                <tap-instance></tap-instance>
                <tap-instance></tap-instance>
                <tap-instance></tap-instance>
            </div>
        </div>

        `
    }
}

customElements.define("tap-editor", TapEditor)
