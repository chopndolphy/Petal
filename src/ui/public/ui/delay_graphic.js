import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { delayTimesL, delayTimesR } from '../event_listener.js';
import { Smoothening } from './ui/utility.js';


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
        this.sx = new Smoothening(0.025, 0);
        this.sy = new Smoothening(0.025, 0);
        this.sz = new Smoothening(0.025, r);
        this.camera.position.set(0, 0, r);
        this.camera.lookAt(0, 0, 0);
        this.renderer.render(this.scene, this.camera);

        this.onMouseMove = (e) => {
            const rect = this.container.getBoundingClientRect();
            const isLeft = (e.clientX - rect.left) < this.width / 2 ? -1 : 1;
            const r = 4;
            this.sx.set(isLeft * r * 0.5);
            this.sy.set(-r * 0.5);
            this.sz.set(-r * -0.7);
        };

        this.onMouseLeave = () => {
            const r = 4;
            this.sx.set(0);
            this.sy.set(0);
            this.sz.set(r);
        };

        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove);
        this.renderer.domElement.addEventListener("mouseleave", this.onMouseLeave);

        this.animate();
    }

    #arcPositions(xOffset, radius, startAngle, endAngle) {
        const curve = new THREE.ArcCurve(xOffset, 0, radius, startAngle, endAngle);
        const positions = [];
        for (const p of curve.getPoints(64)) {
            positions.push(p.x, p.y, 0);
        }
        return positions;
    }

    createArcs() {
        for (let channel = 0; channel < 2; channel++) {
            const startAngle = channel === 0 ? Math.PI * 0.75 : Math.PI * 1.5;
            const endAngle = startAngle + Math.PI * 0.75;
            const xOffset = channel === 0 ? -0.0625 : 0.0625;

            for (let tap = 0; tap < 8; tap++) {
                const radius = channel === 0 ? delayTimesL[tap] : delayTimesR[tap];

                const geometry = new LineGeometry();
                geometry.setPositions(this.#arcPositions(xOffset, radius, startAngle, endAngle));

                const material = new LineMaterial({ color: 0xE58578, linewidth: 2 });
                material.resolution.set(this.width, this.height);

                const arc = new Line2(geometry, material);
                arc.computeLineDistances();

                let z = channel === 0 ? tap * -0.125 : tap * -0.125;
                z = Math.cos(z * Math.PI / 2);
                arc.position.z = z;

                this.arcs.push({ mesh: arc, channel, tap, xOffset, startAngle, endAngle });
                this.scene.add(arc);
            }
        }
    }

    updateArcs() {
        for (const { mesh, channel, tap, xOffset, startAngle, endAngle } of this.arcs) {
            const radius = channel === 0 ? delayTimesL[tap] : delayTimesR[tap];
            mesh.geometry.setPositions(this.#arcPositions(xOffset, radius, startAngle, endAngle));
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
        this.renderer?.domElement.removeEventListener("mousemove", this.onMouseMove);
        this.renderer?.domElement.removeEventListener("mouseleave", this.onMouseLeave);
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