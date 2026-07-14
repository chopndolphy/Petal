import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class PetalButton extends LitElement {
    static properties = {
        onLabel: {},
        offLabel: {},
        value: { type: Boolean },
        drawing: { type: Object }
    }

    static styles = css`
        button {
            border: none;
            outline: none;
            background-color: var(--button-bg, transparent);
            text-align: var(--button-align, center);
            color: var(--button-color, #6c6c6c);
            font-family: var(--button-font, "Verdana");
            font-size: var(--button-font-size, 14px);
            width: var(--button-width, 200px);
            height: var(--button-height, 30px);
            padding: 0;
            cursor: pointer;
            overflow: hidden;
        }
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    `;

    constructor() {
        super();
        this.onLabel = "On"
        this.offLabel = "Off"
        this.value = false; // actually get from juce
        this.drawing = null;
    }

    firstUpdated() {
        this.button = this.shadowRoot.querySelector('button');
        this.button.addEventListener("click", () => {
            this.value = !this.value;
            this.displayText = this.value ? this.onLabel : this.offLabel;
        })
    }

    updated(changedProps) { if (this.drawing) this.draw(); }

    draw() {
        const canvas = this.shadowRoot.querySelector('canvas');
        if (!canvas || !this.drawing) return;

        const button = this.shadowRoot.querySelector('button');
        const w = button.offsetWidth;  
        const h = button.offsetHeight; 
        canvas.width = w;              
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        this.drawing(ctx, w, h, this.value);
    }

    handleClick() { this.dispatchEvent(new CustomEvent('change', { detail: this.value })); }

    render() {
        return html`
            <button @click=${this.handleClick}>
                ${this.drawing
                ? html`<canvas></canvas>`
                : (this.value ? this.onLabel : this.offLabel)
                }
            </button>`;
    }
}

customElements.define('petal-button', PetalButton);
