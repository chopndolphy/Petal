import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { getSliderState } from '../../juce.js';

export class NumberSlider extends LitElement {
    static properties = {
        min: {},
        max: {},
        suffix: {},
        mode: {}, // time, percent...etc
        juceID: { type: String, attribute: 'juceid' }

    }

    static styles = css`
    input {
        border: transparent;
        outline: transparent;
        background-color: var(--numbox-bg, transparent);
        text-align: var(--numbox-align, left);
        color: var(--numbox-color, #6c6c6c);
        font-family: var(--numbox-font, "Verdana");
        font-size: var(--numbox-font-size, 14px);
        width: var(--numbox-width, 60px);
        height: var(--numbox-height, 30px);
    }
`;


    constructor(){
        super();
        this.min = 0;
        this.max = 100;
        this.suffix = "";

        this.addEventListener("pointerdown", this.down);
        this.addEventListener("pointermove", this.move);
        this.addEventListener("pointerup", this.up);
    }

    firstUpdated(){
        this.input = this.shadowRoot.querySelector('input');
        this.juceSlider = getSliderState(this.juceID);
        console.log(this.juceSlider)
        const updateFromJuce = () => {
            const norm = this.juceSlider.getNormalisedValue();
            const value = this.min + norm * (this.max - this.min);
            this.input.value = value.toFixed(2) + this.suffix;
        };

        updateFromJuce(); 
        this.juceSlider.valueChangedEvent.addListener(updateFromJuce);
    }

    lastClickTime = null;
    lastClickYPos = null;
    mouseState = "idle"

    down(e){ 
        e.preventDefault();

        const currentTime = new Date().getTime();
        const deltaTime = currentTime - this.lastClickTime;

        if (deltaTime < 500 && deltaTime > 50) {
            this.lastClickTime = 0;
            this.input.focus();

        } else {
            if (e.metaKey) { this.reset(); }

            this.lastClickTime = currentTime;
            this.lastClickYPos = e.clientY;
            this.setPointerCapture(e.pointerId);
            this.mouseState = "drag"
        }
    }

    move(e){
        if (this.mouseState === "drag") {
            if (!this.hasPointerCapture(e.pointerId)) return;

            const deltaY = this.lastClickYPos - e.clientY; 
            const range = this.max - this.min;
            const norm = Math.min(1, Math.max(0, (deltaY + 500) / 1000)); 
            const value = this.min + norm * range;

            this.input.value = value.toFixed(2) + this.suffix;
            this.juceSlider.setNormalisedValue(norm);
        }
    }

    up(e){
        this.mouseState = "idle";
    }

    reset(){ console.log("reset called")}

    render(){
        return html`
        <input></input>
        `;
    }

}

customElements.define('number-slider', NumberSlider);
