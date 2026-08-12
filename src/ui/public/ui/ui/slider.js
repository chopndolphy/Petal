import { LitElement, html, css } from 'lit';
import { getSliderState } from '../../juce.js';
import { color } from '../drawings.js';

export class PetalSlider extends LitElement {
    static properties = {
        min: { type: Number },
        max: { type: Number },
        suffix: { type: String },
        mode: { type: String },
        exponent: { type: Number },
        sensitivity: { type: Number },
        fineFactor: { type: Number },
        default: { type: Number, attribute: 'default' },
        enumerators: {
            converter: {
                fromAttribute: (v) => (v ? v.split(',').map((s) => s.trim()) : []),
                toAttribute: (v) => (Array.isArray(v) ? v.join(',') : v),
            },
        },
        juceID: { type: String, attribute: 'juceid' },
        drawing: { type: Object },
        drawingAux: { type: Object },
    };

    static styles = css`
        :host {
            display: flex;
            justify-content: var(--numbox-align, flex-start);
            width: var(--slider-width, auto);
        }

        input {
            border: transparent;
            outline: transparent;
            background-color: var(--numbox-bg, transparent);
            text-align: var(--numbox-align, left);
            color: var(--numbox-color, #aaaaaa);
            font-family: var(--numbox-font, "Verdana");
            font-size: var(--numbox-font-size, 14px);
            width: var(--numbox-width, 75px);
            height: var(--numbox-height, 15px);
            cursor: ns-resize;
        }
        input:focus {
            cursor: text;
        }
        canvas {
            display: block;
            width: var(--slider-width, 75px);
            height: var(--slider-height, 15px);
            cursor: ns-resize;
        }
    `;

    constructor() {
        super();
        this.min = 0;
        this.max = 100;
        this.suffix = "";
        this.mode = "";
        this.exponent = 1;
        this.sensitivity = 0.005;
        this.fineFactor = 0.2;
        this.default = 0;
        /** @type {string[]} */
        this.enumerators = [];
        this.drawing = null;
        this.drawingAux = null;
        this.norm = 0;


        this.addEventListener("pointerdown", this.down);
        this.addEventListener("pointermove", this.move);
        this.addEventListener("pointerup", this.up);
    }

    firstUpdated() {
        this.input = this.shadowRoot.querySelector('input');
        this.canvas = this.shadowRoot.querySelector('canvas');

        if (this.canvas) {
            this.resizeObserver = new ResizeObserver((entries) => {
                const { width, height } = entries[0].contentRect;
                const dpr = window.devicePixelRatio || 1;

                this.canvas.width = Math.round(width * dpr);
                this.canvas.height = Math.round(height * dpr);
                this.w = width;
                this.h = height;

                this.drawCanvas();
            });
            this.resizeObserver.observe(this.canvas);
        }

        this.rebindJuceSlider();

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.tryCommit()) {
                        this.isEditing = false;
                        this.input.blur();
                    } else {
                        this.input.value = this.editString(this.juceSlider.getNormalisedValue());
                        this.input.select();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.isEditing = false;
                    this.updateDisplay(this.juceSlider.getNormalisedValue());
                    this.input.blur();
                }
            });

            this.input.addEventListener('blur', () => {
                if (this.isEditing && !this.tryCommit()) {
                    this.updateDisplay(this.juceSlider.getNormalisedValue());
                } else if (!this.isEditing) {
                    this.updateDisplay(this.juceSlider.getNormalisedValue());
                }
                this.isEditing = false;
            });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        if (this.onJuceChange) {
            this.juceSlider?.valueChangedEvent.removeListener(this.onJuceChange);
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('drawing') || changedProperties.has('drawingAux')) {
            this.drawCanvas();
        }

        if (changedProperties.has('juceID') && this.hasUpdated) {
            this.rebindJuceSlider();
        }
    }

    rebindJuceSlider() {
        if (this.onJuceChange) {
            this.juceSlider?.valueChangedEvent.removeListener(this.onJuceChange);
        }
        this.juceSlider = getSliderState(this.juceID);
        this.onJuceChange = () => {
            if (this.isEditing) return;
            this.updateDisplay(this.juceSlider.getNormalisedValue());
        };
        this.onJuceChange();
        this.juceSlider.valueChangedEvent.addListener(this.onJuceChange);
    }


    lastClickTime = 0;
    lastClickYPos = 0;
    startNorm = 0;
    mouseState = "idle";
    isEditing = false;

    down(e) {
        e.preventDefault();

        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastClickTime;

        if (this.input && deltaTime < 500 && deltaTime > 50) {
            this.lastClickTime = 0;
            this.mouseState = "idle";
            this.isEditing = true;
            this.input.value = this.editString(this.juceSlider.getNormalisedValue());
            this.input.focus();
            this.input.select();
            return;
        }

        if (e.metaKey) {
            this.reset();
            return;
        }

        this.lastClickTime = currentTime;
        this.lastClickYPos = e.clientY;
        this.startNorm = this.juceSlider.getNormalisedValue(); 
        this.setPointerCapture(e.pointerId);
        this.mouseState = "drag";
    }

    move(e) {
        if (this.mouseState !== "drag") return;
        if (!this.hasPointerCapture(e.pointerId)) return;

        const deltaY = this.lastClickYPos - e.clientY; // up = increase
        const sens = e.shiftKey ? this.sensitivity * this.fineFactor : this.sensitivity;

        const norm = this.startNorm + deltaY * sens;
        this.applyNorm(norm);
    }

    up() {
        this.mouseState = "idle";
    }

    reset() {
        this.applyNorm(this.default);
    }

    normToValue(norm) {
        const shaped = Math.pow(Math.min(1, Math.max(0, norm)), this.exponent);
        return this.min + shaped * (this.max - this.min);
    }

    valueToNorm(value) {
        const range = this.max - this.min;
        if (range === 0) return 0;
        const frac = Math.min(1, Math.max(0, (value - this.min) / range));
        return Math.pow(frac, 1 / this.exponent);
    }

    applyNorm(norm) {
        norm = Math.min(1, Math.max(0, norm));

        if (this.mode === "enum" && this.enumerators.length > 1) {
            const n = this.enumerators.length;
            const index = Math.round(norm * (n - 1));
            norm = index / (n - 1);
        }

        this.juceSlider.setNormalisedValue(norm);
        this.updateDisplay(norm);
    }

    updateDisplay(norm) {
        this.norm = norm;

        if (this.canvas) {
            this.drawCanvas();
        } else if (this.input) {
            this.input.value = this.formatDisplay(this.normToValue(norm), norm);
        }
    }

    drawCanvas() {
        if (!this.canvas || !this.drawing) return;
        const ctx = this.canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const w = this.w ?? this.canvas.width / dpr;
        const h = this.h ?? this.canvas.height / dpr;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        this.drawing(ctx, w, h, this.norm, this.drawingAux);
        ctx.restore();
    }

    tryCommit() {
        const raw = this.input.value;

        let norm;
        if (this.mode === "enum") {
            const idx = this.enumerators.findIndex(
                (s) => s.toLowerCase() === raw.trim().toLowerCase()
            );
            if (idx < 0) return false; // reject non-matching label
            norm = this.enumerators.length > 1 ? idx / (this.enumerators.length - 1) : 0;
        } else {
            const value = this.parseNumeric(raw);
            if (value === null) return false; // reject non-numbers
            const clamped = Math.min(this.max, Math.max(this.min, value));
            norm = this.valueToNorm(clamped);
        }

        this.juceSlider.setNormalisedValue(norm);
        this.updateDisplay(norm); // re-applies the suffix
        return true;
    }

    parseNumeric(raw) {
        const m = raw.trim().match(/^([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*([a-zA-Z%]*)$/);
        if (!m) return null;

        const num = parseFloat(m[1]);
        if (Number.isNaN(num)) return null;

        if (this.mode === "time") {
            const unit = m[2].toLowerCase();
            if (unit === "s") return num * 1000; 
            return num;
        }
        return num;
    }

    editString(norm) {
        const value = this.normToValue(norm);
        switch (this.mode) {
            case "enum": {
                const n = this.enumerators.length;
                if (!n) return "";
                const i = Math.min(n - 1, Math.max(0, Math.round(norm * (n - 1))));
                return this.enumerators[i];
            }
            case "time":
                return String(Math.round(value)); // edit in bare ms
            default:
                return String(+value.toFixed(4));  // trims trailing zeros, drops suffix/%
        }
    }

    formatDisplay(value, norm) {
        switch (this.mode) {
            case "enum": {
                const n = this.enumerators.length;
                if (!n) return "";
                const index = Math.min(n - 1, Math.max(0, Math.round(norm * (n - 1))));
                return this.enumerators[index];
            }
            case "time":
                return this.formatTime(value); // value is in ms
            case "percent":
                return `${value.toFixed(0)}%`;
            case "int":
                return `${ Math.floor(value) + this.suffix }`;
            default:
                return value.toFixed(1) + this.suffix;
        }
    }

    formatTime(ms) {
        if (ms < 1000) return `${Math.round(ms)} ms`;
        const s = ms / 1000;
        if (s < 10) return `${s.toFixed(0)} s`;
        return `${s.toFixed(1)} s`;
    }

    render() {
        return this.drawing ? html`<canvas></canvas>` : html`<input></input>`;
    }
}

customElements.define('petal-slider', PetalSlider);
