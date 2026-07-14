import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';


import { render, matcapTexture, source } from './matcap.js'
import { reverbLevelMsr } from '../event_listener.js';

export class ReverbGraphic extends LitElement {
    color1 = [237, 121, 67];
    color2 = [237, 117, 128];
    ellipses = [];

    static properties = {
        width: { type: Number },
        height: { type: Number }
    }

    static styles = css`
        #canvas-container {
            position: relative;;
            width: 200px;
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
        this.width = 200;
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
        this.camera.position.z = 7;

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

        this.geometry = new THREE.PlaneGeometry(8, 4, 100, 1);
        this.vertexCount = this.geometry.attributes.position.count;
        this.basePositions = this.geometry.attributes.position.array.slice();
        this.srcPos = this.geometry.attributes.position.array.slice();

        this.bufferData = [];
        for (let i = 0; i < this.vertexCount; i++) {
            this.bufferData.push(Math.sin((Math.PI * 2 / this.vertexCount) * i));
        }

        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.rotateZ(Math.PI/2)
        this.mesh.rotateX(-Math.PI/4)
        this.scene.add(this.mesh);

    }

    modifyGeometry(val){
        const pos = this.mesh.geometry.attributes.position; // mutate the mesh's own attribute in place

        for (let i = 0; i < this.vertexCount; i++) {
            const theta = this.bufferData[i];
            const ix = i * 3;
            const x = this.srcPos[ix];
            const y = this.srcPos[ix + 1];
            const z = this.srcPos[ix + 2] + Math.cos(theta * val) / 4;
            pos.setXYZ(i, x, y, z);
        }

        pos.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();
    }

    animate() {
        this.raf = requestAnimationFrame(() => this.animate());
        this.modifyGeometry(Math.abs(reverbLevelMsr) * 10)
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