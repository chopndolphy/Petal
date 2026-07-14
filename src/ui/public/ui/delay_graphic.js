import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';


import { render, matcapTexture, source } from './matcap.js'
import { delayTimesL, delayTimesR } from '../event_listener.js';




export class DelayGraphic extends LitElement {
    color1 = [237, 121, 67];
    color2 = [237, 117, 128];
    ellipses = [];

    static property = {
        width: { type: Number },
        height: { type: Number }
    }

    static styles = css`
        #canvas-container {
            position: relative;;
            width: 400px;
            height: 300px;
        }

        #canvas-container > canvas {
            position: absolute;
            top: 0;
            left: 0;
        }

        #overlay {
            z-index: 1;
        }

    `

    constructor() {
        super();
        render();
        this.width = 400;
        this.height = 300;
    }

    firstUpdated() {
        this.container = this.renderRoot.querySelector("#canvas-container");
        const resizeObserver = new ResizeObserver(() => {
            if (this.width > 0) {
                resizeObserver.disconnect();
                this.initializeSpace();
            }
        });
        resizeObserver.observe(this.container);
    }

    initializeSpace() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#161616')
        this.camera = new THREE.PerspectiveCamera(75,
            this.width / this.height,
            0.1,
            1000);
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(3)
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.filter = 'blur(0px)';

        this.createEllipses();
        this.ellipses.forEach(e => this.scene.add(e));

        this.animate();
    }


    createEllipses() {
        const material = new THREE.MeshMatcapMaterial();
        material.matcap = matcapTexture;
        material.transparent = true;
        material.opacity = 1;

        this.donuts = []; // 

        for (let channel = 0; channel < 2; channel++) {
            const startAngle = channel === 0 ? Math.PI * 0.75 : Math.PI * 1.5;
            const xOffset = channel === 0 ? 0.25 : -0.25;

            for (let tap = 0; tap < 8; tap++) {
                const radius = channel === 0 ? delayTimesL[tap] : delayTimesR[tap];
                const geometry = new THREE.TorusGeometry(radius *8 , 1, 100, 100, Math.PI * 0.75);
                geometry.rotateZ(startAngle + Math.PI);

                const donutMesh = new THREE.Mesh(geometry, material);
                donutMesh.position.x = xOffset;
                donutMesh.position.z = -4;

                this.ellipses.push(donutMesh);
                this.donuts.push({ mesh: donutMesh, channel, tap, xOffset, startAngle });
            }
        }
    }

    updateEllipses() {
        for (const { mesh, channel, tap, xOffset, startAngle } of this.donuts) {
            const radius = channel === 0 ? delayTimesL[tap] : delayTimesR[tap];

            mesh.geometry.dispose();
            mesh.geometry = new THREE.TorusGeometry(radius * 8, 1, 100, 100, Math.PI * 0.75);
            mesh.geometry.rotateZ(startAngle + Math.PI);
        }
    }

    animate() {
        this.raf = requestAnimationFrame(() => this.animate());
        this.updateEllipses();
        this.renderer.render(this.scene, this.camera);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        cancelAnimationFrame(this.raf);
        this.renderer?.dispose();
    }

    render() {
        return html`<div id="canvas-container"></div>`;
    }
}

customElements.define('delay-graphic', DelayGraphic);