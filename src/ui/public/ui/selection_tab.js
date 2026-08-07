import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { drawButton } from './drawings.js';
import "./ui/slider.js"
import "./ui/button.js"
import { drawReverbSend, drawPitch, drawTapState, drawSelectDelay, drawSelectReverb } from './drawings.js';

export class SelectionTab extends LitElement {
    static properties = {
        isDisplayingDelay: { type: Boolean },
        isDisplayingIO: { type: Boolean }
    }

    constructor(){
        super()
        this.isDisplayingDelay = false;
        this.isDisplayingIO = true;
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

    render(){
        return html`
        <div style="display: flex; flex-direction: column; display: space-between">
            <petal-button
                @click=${() => this._selectDelay(true)}
                style="--button-width: 50px;
                --button-height: 100px"
                .drawing=${drawSelectDelay}>
            </petal-button>

            <petal-button
                @click=${() => this._selectDelay(false)}
                style="--button-width: 50px;
                --button-height: 100px"
                .drawing=${drawSelectReverb}>
            </petal-button>

            <petal-button
                @click=${() => this._toggleIO()}
                style="--button-width: 50px;
                --button-height: 100px"
                .drawing=${drawButton}>
            </petal-button>
        </div>
        `
    }

    // petal-button toggles its own internal .value on every click, so the tab
    // pair's shared "which one is active" state has to be re-asserted onto the
    // DOM after every click, even a no-op one, or the clicked button visually
    // flips even when isDisplayingDelay didn't change.
    updated() {
        const [delayButton, reverbButton, ioButton] = this.shadowRoot.querySelectorAll('petal-button');
        if (delayButton) delayButton.value = this.isDisplayingDelay;
        if (reverbButton) reverbButton.value = !this.isDisplayingDelay;
        if (ioButton) ioButton.value = this.isDisplayingIO;
    }

    _selectDelay(isDelay) {
        if (this.isDisplayingDelay === isDelay) {
            this.requestUpdate();
            return;
        }
        this.dispatchEvent(new CustomEvent('display-delay-change', {
            detail: isDelay,
            bubbles: true,
            composed: true
        }));
    }

    _toggleIO() {
        this.dispatchEvent(new CustomEvent('display-io-change', {
            detail: !this.isDisplayingIO,
            bubbles: true,
            composed: true
        }));
    }
}



customElements.define("selection-tab", SelectionTab)
