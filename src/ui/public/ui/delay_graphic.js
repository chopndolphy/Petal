import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import * as THREE from 'three';
import { getSliderState } from '../juce.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { delayTimesL, delayTimesR, tapStates } from '../event_listener.js';
import { Smoothening } from './ui/utility.js';
import { color, lerpColor } from './drawings.js';

export class DelayGraphic extends LitElement {
    arcs = [];

    static properties = {
        width: { type: Number },
        height: { type: Number }
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        #canvas-container {
            position: relative;
            width: 100%;
            height: 100%;
        }

        #canvas-container > canvas {
            position: absolute;
            top: 0;
            left: 0;
        }
    `
    
    constructor() {
        super();
        this.width = 0;
        this.height = 0;
    }

    firstUpdated() {
        this.container = this.renderRoot.querySelector("#canvas-container");

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                resizeObserver.disconnect();
                this.width = width;
                this.height = height;
                this.initializeSpace();
            }
        });
        resizeObserver.observe(this.container);

        // initialize attachment sliders to JUCE
        this.positionLSlider = getSliderState("positionL");
        this.skewLSlider = getSliderState("skewL");
        this.positionRSlider = getSliderState("positionR");
        this.skewRSlider = getSliderState("skewR");
    }

    initializeSpace() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1.15, 1.15, -1.15, 1.15);

        this.createArcs();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(4);
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        const r = 4;
        this.sx = new Smoothening(0.05, 0);
        this.sy = new Smoothening(0.05, 0);
        this.sz = new Smoothening(0.05, r);
        this.camera.position.set(0, 0, r);
        this.camera.lookAt(0, 0, 0);
        this.renderer.render(this.scene, this.camera);

        this.sOpacity = new Smoothening(0.025, 0);

        // pointer handlers
        this.mouseState = 'idle';
        this.lastClickXPos = null;
        this.lastClickYPos = null;

        // running normalized pad state per side, since sliders are write-only
        // from here (no synchronous read-back), additive dragging needs a
        // local value to accumulate onto
        this.padValues = {
            dragL: { pos: 0.5, skew: 0.5 },
            dragR: { pos: 0.5, skew: 0.5 }
        };

        this.padSensitivity = 1.0; // tune: >1 = more sensitive, <1 = more precise

        this.onMouseDown = (e) => {
            const rect = this.container.getBoundingClientRect();
            const isLeft = (e.clientX - rect.left) < this.width / 2;
            this.mouseState = isLeft ? 'dragL' : 'dragR';
            this.lastClickXPos = e.clientX;
            this.lastClickYPos = e.clientY;
        };

        this.onMouseMove = (e) => {
            if (this.mouseState === 'idle'){
                const rect = this.container.getBoundingClientRect();
                const isLeft = (e.clientX - rect.left) < this.width / 2;
                const r = 4;
                this.sx.set(isLeft ? -1 : 1 * r * 0.5);
                this.sy.set(-r * 0.5);
                this.sz.set(-r * -0.7);
            }

            if (this.mouseState === 'dragL' || this.mouseState === 'dragR') {
                const deltaX = (e.clientX - this.lastClickXPos) / this.width;
                const deltaY = (e.clientY - this.lastClickYPos) / this.height;

                const state = this.padValues[this.mouseState];
                state.pos = Math.max(0, Math.min(1, state.pos + deltaX * this.padSensitivity));
                state.skew = Math.max(0, Math.min(1, state.skew - deltaY * this.padSensitivity)); // up = increase

                if (this.mouseState === 'dragL') {
                    this.positionLSlider.setNormalisedValue(state.pos);
                    this.skewLSlider.setNormalisedValue(state.skew);
                } else {
                    this.positionRSlider.setNormalisedValue(state.pos);
                    this.skewRSlider.setNormalisedValue(state.skew);
                }

                // roll reference point forward so next move is relative to this one
                this.lastClickXPos = e.clientX;
                this.lastClickYPos = e.clientY;
            }
        };

        this.onMouseLeave = () => {
            const r = 4;
            this.sx.set(0);
            this.sy.set(0);
            this.sz.set(r);
        };

        this.onMouseUp = (e) => {
            this.mouseState = 'idle';
        };

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove);
        this.renderer.domElement.addEventListener("mouseleave", this.onMouseLeave);
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp);
        this.animate();
    }

    #arcPositions(xOffset, radius, startAngle, endAngle, segmentCount) {
        const curve = new THREE.ArcCurve(xOffset, 0, radius, startAngle, endAngle);
        const positions = [];
        for (const p of curve.getPoints(segmentCount)) {
            positions.push(p.x, p.y, 0);
        }
        return positions;
    }

    sampleGradientColors(steps, direction = false, tap = 0.5, isActive = true) {
        const canvas = document.createElement('canvas');
        canvas.width = steps;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, steps, 0);

        let a = "#CB8B93" // og pink
        let b = "#E3895A" // og orange
        let c = "#BEDBBA"//"#2d2d2d"
        grad.addColorStop(0, !direction ? b : a);
        grad.addColorStop(!direction ? 0.3 : 0.7, direction ? c : a);
        grad.addColorStop(1, !direction ? b : b);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, steps, 1);

        const imgData = ctx.getImageData(0, 0, steps, 1).data;
        const colors = [];

        const srgbToLinear = (c) =>
            c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

        for (let i = 0; i < steps; i++) {
            const r = srgbToLinear(imgData[i * 4] / 255);
            const g = srgbToLinear(imgData[i * 4 + 1] / 255);
            const b = srgbToLinear(imgData[i * 4 + 2] / 255);
            colors.push(r, g, b);
        }
        return colors;
    }

    createArcs() {
        for (let channel = 0; channel < 2; channel++) {
            const startAngle = channel === 0 ? Math.PI * 0.75 : Math.PI * 1.5;
            const endAngle = startAngle + Math.PI * 0.75;
            const xOffset = channel === 0 ? -0.03125 : 0.03125;

            for (let tap = 0; tap < 8; tap++) {
                const radius = channel === 0 ? delayTimesL[tap] : delayTimesR[tap];

                // fix segment count based on max possible radius, not live radius,
                // so vertex count never changes frame-to-frame
                const maxRadius = 4; // TODO: set to your actual max delay-time radius
                const arcLength = maxRadius * (endAngle - startAngle);
                const segmentCount = Math.max(64, Math.round(arcLength * 48));

                const geometry = new LineGeometry();
                const positions = this.#arcPositions(xOffset, radius, startAngle, endAngle, segmentCount);

                geometry.setPositions(positions);
                const vertexCount = positions.length / 3; // one RGB triple needed per vertex

                geometry.setColors(this.sampleGradientColors(vertexCount, channel === 0, 0.125 * tap));

                const c = lerpColor(color.pink, color.orange, 0.125 * tap);
                const material = new LineMaterial({
                    linewidth: 3,
                    vertexColors: true,
                    transparent: true,
                });
                material.resolution.set(this.width, this.height);

                const arc = new Line2(geometry, material);
                arc.computeLineDistances();

                let z = channel === 0 ? tap * -0.125 : tap * -0.125;
                z = Math.cos(z * Math.PI / 2);
                arc.position.z = z;

                this.arcs.push({
                    mesh: arc,
                    channel,
                    tap,
                    xOffset,
                    startAngle,
                    endAngle,
                    segmentCount,
                    opacitySmooth: new Smoothening(0.05, tapStates[tap] === 1 ? 1 : 0)
                });
                this.scene.add(arc);
            }
        }
    }

    updateArcs() {
        for (const { mesh, channel, tap, xOffset, startAngle, endAngle, segmentCount, opacitySmooth } of this.arcs) {
            const radius = channel === 0 ? delayTimesL[tap] : delayTimesR[tap];
            mesh.geometry.setPositions(this.#arcPositions(xOffset, radius, startAngle, endAngle, segmentCount));

            opacitySmooth.set(tapStates[tap] === 1 ? 1 : 0);
            mesh.material.opacity = opacitySmooth.get();
            mesh.visible = mesh.material.opacity > 0.001;
        }
    }

    animate() {
        this.raf = requestAnimationFrame(() => this.animate());

        this.updateArcs();

        this.camera.position.set(this.sx.get(), this.sy.get(), this.sz.get());
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        cancelAnimationFrame(this.raf);
        this.renderer?.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer?.domElement.removeEventListener("mousemove", this.onMouseMove);
        this.renderer?.domElement.removeEventListener("mouseleave", this.onMouseLeave);
        this.renderer?.domElement.removeEventListener("mouseup", this.onMouseUp);
        for (const { mesh } of this.arcs) {
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        this.renderer?.dispose();
    }

    render() {
        return html`<div id="canvas-container"></div>`;
    }
}

customElements.define('delay-graphic', DelayGraphic);