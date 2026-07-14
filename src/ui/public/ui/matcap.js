import * as THREE from 'three';

const colorA = [243, 175, 63];
const colorB = [238, 147, 165];
const colorC = [199, 215, 244];
const colorD = [211, 187, 151]
const colorE = [202, 215, 241];



const rgb = (c) => `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;

let sourceData = null;
const size = 256;
const cx = size / 2;
const cy = size / 2;

export const viewer = document.getElementById('viewer')
export const source = document.getElementById('source')
export const viewCtx = viewer.getContext('2d', { willReadFrequently: true });
const srcCtx = source.getContext('2d', { willReadFrequently: true });
export const matcap = { viewer, source, viewCtx, srcCtx };

export const matcapTexture = new THREE.CanvasTexture(viewer);
matcapTexture.colorSpace = THREE.SRGBColorSpace;

function drawMatcap(hlAngle = 0) {





    const c = srcCtx;
    c.fillRect(0, 0, size, size);


    const colA = '#9a8240' // faint tan
    const colB = '#54865f' // faint orange
    const colC = '#40677d' // pink
    const colD = '#848b93' // almost red
  
    
    c.beginPath();
    c.arc(cx, cy, size / 2, 0, Math.PI * 2, true);
    const gradA = c.createRadialGradient(cx, cy, 0, 
        cx, cy, size/2);
    gradA.addColorStop(0, '#161616')
    gradA.addColorStop(1, '#6a6a6a')

    c.fillStyle = gradA;
    c.fill()

    
    c.beginPath();
    c.arc(size * 0.25, 
        size * 0.25, 
        size * 0.25, 
        0, 
        Math.PI * 2, 
        true);
    const gradB = c.createRadialGradient(size * 0.2, 
        size * 0.25, 
        0,
        size * 0.25, 
        size * 0.25, 
        size * 0.2);

    gradB.addColorStop(0.0, colB)
    gradB.addColorStop(0.35, colC)
    gradB.addColorStop(0.9, colD)
  // gradB.addColorStop(1, '#161616')

    c.fillStyle = gradB;
    c.fill()

    // highlight 2
    
    c.beginPath();
    c.arc(size * 0.5,
        size * 0.85,
        size * 0.3,
        0,
        Math.PI * 2,
        true);
    const gradC = c.createRadialGradient(size * 0.5,
        size * 0.85,
        0,
        size * 0.5,
        size * 0.85,
        size * 0.3);
    gradC.addColorStop(0.1, colA)
    gradC.addColorStop(0.8, colB)
    gradC.addColorStop(0.85, colC)
    gradC.addColorStop(0.9, colD)
    gradC.addColorStop(1, '#161616')
    c.fillStyle = gradC;
    c.fill()

    // highlight 3

    c.beginPath();
    c.arc(size * 0.7,
        size * 0.2,
        size * 0.2,
        0,
        Math.PI * 2,
        true);
    const gradD = c.createRadialGradient(size * 0.7,
        size * 0.2,
        0,
        size * 0.7,
        size * 0.2,
        size * 0.2);
    gradD.addColorStop(0.1, colA)
    gradD.addColorStop(0.8, colB)
    gradD.addColorStop(0.85, colC)
    gradD.addColorStop(0.9, colD)
    gradD.addColorStop(1, '#7e7e7e')
    c.fillStyle = gradD;
    c.fill()

    c.beginPath();
    c.arc(size * 0.2,
        size * 0.5,
        size * 0.025,
        0,
        Math.PI * 2,
        true);
    c.fillStyle = 'white';
    c.fill()
        
    
}

function cacheSource() {
    sourceData = srcCtx.getImageData(0, 0, size, size);
}

function sample(data, x, y) {
    x = Math.max(0, Math.min(size - 1, x));
    y = Math.max(0, Math.min(size - 1, y));
    const x0 = x | 0, y0 = y | 0;
    const x1 = Math.min(size - 1, x0 + 1), y1 = Math.min(size - 1, y0 + 1);
    const fx = x - x0, fy = y - y0;
    const i00 = (y0 * size + x0) * 4, i10 = (y0 * size + x1) * 4,
        i01 = (y1 * size + x0) * 4, i11 = (y1 * size + x1) * 4;
    const out = [0, 0, 0, 0];
    for (let k = 0; k < 4; k++) {
        const top = data[i00 + k] * (1 - fx) + data[i10 + k] * fx;
        const bot = data[i01 + k] * (1 - fx) + data[i11 + k] * fx;
        out[k] = top * (1 - fy) + bot * fy;
    }
    return out;
}

function renderFishEye(strength = 1, radius = 0.8) {
    if (!sourceData) cacheSource();
    const dest = viewCtx.createImageData(size, size);
    const d = dest.data, s = sourceData.data;
    const R = radius * Math.hypot(size / 2, size / 2);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = (x - cx) / R, dy = (y - cy) / R;
            const rd = Math.hypot(dx, dy);
            let sx, sy;
            if (rd < 1 && rd > 0) {
                const scale = Math.pow(rd, strength) / rd;
                sx = cx + dx * R * scale;
                sy = cy + dy * R * scale;
            } else { sx = x; sy = y; }
            const p = sample(s, sx, sy);
            const o = (y * size + x) * 4;
            d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2]; d[o + 3] = p[3];
        }
    }
    viewCtx.putImageData(dest, 0, 0);
}

export function render(angle) {
    drawMatcap(angle);
    cacheSource();
    renderFishEye(7, 0.7);
    matcapTexture.needsUpdate = true;
}