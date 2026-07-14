import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { drawButton } from './drawings.js';
import "./ui/numbox.js"
import "./ui/button.js"
import "./ui/dial.js"
import { drawReverbSend, drawPitch, drawLock } from './drawings.js';

export class TapEditorInstance extends LitElement {
    static properties = {
        selected: { type: Boolean }
    }

    constructor(){
        super()
        this.selected = false;
    }

    static styles = css `
        #tapInstance {
            height: 20px;
            transition: height 0.5s
        }

        :host([selected]) #tapInstance {
            height: 60px;
        }
    `

    render(){
        return html`
        <div id="tapInstance" style="display: flex; flex-direction: row; margin: 10px">
            <petal-button style="--button-width: 10px; --button-height: 30px" .drawing=${drawButton}></petal-button>

            <div style="display: flex; flex-direction: column;">
                <graphic-slider style="--canvas-width: 200px; --canvas-height: 100px" .drawing=${drawPitch} ?selected=${this.selected}></graphic-slider>
                <number-slider suffix=" st" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></number-slider>
            </div>

            <div style="display: flex; flex-direction: column;">
                <graphic-slider style="--canvas-width: 200px; --canvas-height: 100px" .drawing=${drawReverbSend} ?selected=${this.selected}></graphic-slider>
                <number-slider suffix=" %" style="--numbox-width: 100px; --numbox-font-size: 14px; --numbox-align: center"></number-slider>
            </div>
        </div>
        `
    }
}

customElements.define("tap-instance", TapEditorInstance)

export class TapEditor extends LitElement {
    static properties = {
        selected: { type: Number }
    }

    constructor() {
        super()
        this.selected = 0;
        this.count = 8;
    }


    render() {
        const instances = []
        for (let i = 0; i < 8; i++) {
            instances.push(html`
            <tap-instance
                ?selected=${this.selected === i}
                @pointerdown=${() => this.selected = i}
            ></tap-instance>
            `)
        }

        return html`
        <div id="editor" style="display: flex; flex-direction: column">
        ${instances}
        </div>
        `
    }
}

customElements.define("tap-editor", TapEditor)
