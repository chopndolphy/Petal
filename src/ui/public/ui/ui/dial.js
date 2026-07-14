import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class GraphicSlider extends LitElement {
    static properties = {
        min: {},
        max: {},
        mode: {}, // time, percent...etc
        selected: { type: Boolean, reflect: true },
        isResizeSelected: {type: Boolean}
    }

    static styles = css`
        canvas {
            width: 100px;
            height: 20px;
            transition: height 0.2s ease-in-out; 
        }

        :host([selected]) canvas {
            height: 60px;
            transition: height 0.2s ease-in-out; 
        }
    `;

    constructor() {
        super();
        this.addEventListener("pointerdown", this.down);
        this.addEventListener("pointermove", this.move);
        this.addEventListener("pointerup", this.up);

        this.value = 0;
        this.drawing = null;
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector('canvas')
        this.resizeObserver = new ResizeObserver((e) => {
            this.draw();
        })

        this.resizeObserver.observe(this.canvas);
        this.draw();
    }

    updated(c) {

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
    }


    lastClickYPos = null;
    mouseState = "idle"

    down(e) {        
        this.lastClickYPos = e.clientY;
        this.setPointerCapture(e.pointerId);
        this.mouseState = "drag"
    }

    move(e) {
        if (this.mouseState === "drag") {
            if (!this.hasPointerCapture(e.pointerId)) return;

            let deltaY = Math.abs(this.lastClickYPos - e.clientY)
            this.value = deltaY.toFixed(2)
            this.draw();
        }
    }

    up(e) {
        this.mouseState = "idle";
    }

    draw(){
        const ctx = this.canvas.getContext('2d')
        const w = this.canvas.width;
        const h = this.canvas.offsetHeight;

        ctx.fillStyle = 'black'
        ctx.clearRect(0, 0, w, h)
        this.drawing(ctx, w, h, this.value * 0.01)
    }

    reset() { console.log("reset called") }

    render() {
        return html`
            <canvas></canvas>
        `;
    }

}

customElements.define('graphic-slider', GraphicSlider);
