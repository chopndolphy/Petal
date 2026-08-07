import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import * as THREE from 'three';
import { reverbLevelMsr } from '../event_listener.js';
import "./ui/utility.js"
import { Smoothening } from './ui/utility.js';
import { color } from './drawings.js';

export class ReverbGraphic extends LitElement {

    static properties = {
        width: { type: Number },
        height: { type: Number }
    }

    static styles = css`
        #canvas-container {
            position: relative;;
            width: 450px;
            height: 300px;
        }

        #canvas-container > canvas {
            position: absolute;
            top: 0;
            left: 0;
        }
    `

    constructor() {
        super();
        this.width = 450;
        this.height = 300;

        this.valA = 0;
        this.valB = 0;
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

    createTexture(){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 128;
        canvas.width = size; 
        canvas.height = size;
        ctx.beginPath(); 

        const grad = ctx.createLinearGradient(size/2, 0, size/2, size);
        grad.addColorStop(0, color.orange);
        grad.addColorStop(0.5, color.pink);
        grad.addColorStop(1, color.tan);
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size, size)
        return canvas;
    }

    initializeSpace() {
        this.scene = new THREE.Scene();

        const r = 4;
        this.camera = new THREE.OrthographicCamera(-2, 2, 3, -2); 
        this.camera.position.set(r * -0.5, r * -0.5, r * 0.7);
        this.camera.lookAt(0, 0, 0);

        this.geometry = new THREE.PlaneGeometry(3, 1.5, 128, 24);
        this.pos = this.geometry.attributes.position;
        this.srcPos = this.pos.clone();

        const texture = new THREE.CanvasTexture(this.createTexture());
        texture.colorSpace = THREE.SRGBColorSpace
        const material = new THREE.MeshBasicMaterial({ 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            map: texture
        });
        this.mesh = new THREE.Mesh(this.geometry, material)
        this.mesh.rotation.x = -Math.PI / 2;
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(4)
        this.container.appendChild(this.renderer.domElement);

        this.animate();
    }

    displace(amount = 1, falloff = 0, dampen = 2) {
        const width = this.geometry.parameters.width;
        const colorAttr = this.geometry.attributes.color;
        const vertexColor = new THREE.Color();

        for (let i = 0; i < this.pos.count; i++) {
            const x = this.srcPos.getX(i);
            const y = this.srcPos.getY(i);
            const z = this.srcPos.getZ(i);

            const u = (x + width / 2) / width;
            const falloffExp = falloff * 1 + 1;
            const envelope = Math.pow(1 - u, falloffExp);

            const baseFreq = Math.PI * 2 * amount;
            const carrierFreq = dampen;
            const wave = Math.cos(baseFreq * (1 - envelope) + Math.PI * carrierFreq * x);
            const height = wave * wave;
            const amplitude = height * envelope;

            this.pos.setXYZ(i, x, y, z + amplitude);
        }
        this.pos.needsUpdate = true;
        this.geometry.computeVertexNormals();
    }
    
    animate() {
        const sReverb = new Smoothening(0.05, 0)
        sReverb.set(reverbLevelMsr)

        this.raf = requestAnimationFrame(() => this.animate());

        this.valA = Math.sin(Math.abs(reverbLevelMsr));
        this.valB + 0.001;
        if (this.valB >= 1) { this.valB = 1 }

        this.displace(sReverb.get(), Math.abs(sReverb.get()));
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

customElements.define('reverb-graphic', ReverbGraphic);
