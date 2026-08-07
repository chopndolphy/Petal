import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { getSliderState } from '../../juce.js';

export class ValueSlider extends LitElement {
    static properties = {
        juceID: { type: String, attribute: 'juceid' },
        
        value: { type: Number },
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
        }
    };

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
            cursor: ns-resize;
        }
        input:focus {
            cursor: text;
        }
        canvas {
            display: block;
            width: var(--slider-width, 100px);
            height: var(--slider-height, 100px);
            cursor: ns-resize;
        }
    `;

    constructor() {
        super();

        this.value = 0;
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

    }

    firstUpdated() {
        this.input = this.shadowRoot.querySelector('input');

        this._onJuceChange = () => {
            if (this.isEditing) return;
            this.updateDisplay(this.juceSlider.getNormalisedValue());
        };

        this._onJuceChange();
        this.juceSlider.valueChangedEvent.addListener(this._onJuceChange);

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
    }

    updated(changedProperties) {
        if (changedProperties.has('drawing')) {
            this.drawCanvas();
        }
    }

    updateDisplay(norm) {
        this.norm = norm;

        if (this.input) {
            this.input.value = this.formatDisplay(this.normToValue(norm), norm);
        }
    }

    tryCommit() {
        const raw = this.input.value;

        let norm;
        if (this.mode === "enum") { // mod this only values
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
                return String(Math.round(value));
            default:
                return String(+value.toFixed(4)); 
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
        return html`<input></input>`;
    }
}

customElements.define('value-slider', ValueSlider);
