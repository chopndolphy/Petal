const colA = '#9a8240' // faint tan
const colB = '#54865f' // faint orange
const colC = '#40677d' // pink
const colD = '#848b93' // almost red

const rgb = (c) => `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;

const lerp = (a, b, t) => { return a * t + b * (1 - t); }

export function drawLock(ctx, w, h, val) {
    const color = val ? "#CA8C94" : "#E28960"
    ctx.beginPath();
    ctx.roundRect(w * 0.2, h * 0.48, w * 0.6, h * 0.38, 2);
    ctx.fillStyle = color;
    ctx.fill();

    const cx = w * 0.5;
    const cy = h * 0.48;
    const r = w * 0.18;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx - r, h * 0.4);
    ctx.arc(cx, h * 0.4, r, Math.PI, 0);
    ctx.lineTo(cx + r, cy);
    ctx.strokeStyle = color;
    ctx.lineWidth = w * 0.07;
    ctx.stroke();
}

export function drawButton(ctx, w, h, val){
    const color = val ? "#CA8C94" : "#4b4a4a"
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 4);
    ctx.fillStyle = color;
    ctx.fill();
}



function drawInput(){
    const canvas = document.getElementById("reverbAmt");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, w, h);
}

export function drawPitch(ctx, w, h, val = 0.5) {
    const heightScale = (h - 20) / 60;

    const resolution = 128;
    const windowWidth = 48; 
    const scrollPos = val * resolution; 
    ctx.beginPath();

    for (let i = 0; i <= resolution; i++) {
        const x = w * 0.05 + (w * 0.9 / resolution) * i;

        let d = i - scrollPos;
        d = ((d % resolution) + resolution) % resolution;
        if (d > resolution / 2) d -= resolution;

        let k = 0;
        if (d >= -windowWidth / 2 && d <= windowWidth / 2) {
            k = 0.5 * (1 + Math.cos((Math.PI / (windowWidth / 2)) * d));
        }

        let y = h * 0.95 - k * h * 0.9;
        y = lerp(y, h * 0.05, heightScale)

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.lineTo(w * 0.95, h * 0.95);
    ctx.lineTo(w * 0.05, h * 0.95);
    ctx.closePath();

    const grad = ctx.createLinearGradient(w / 2, 0, w / 2, h);
    grad.addColorStop(0.2, '#7e7e7e')
    grad.addColorStop(0.5, '#cccaca')
    grad.addColorStop(1, colB)

    ctx.fillStyle = grad
    ctx.fill()

    ctx.strokeStyle = grad
    ctx.lineWidth = 4;
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.stroke();

}



export function drawReverbSend(ctx, w, h, val = 0) {
    const heightPercentage = h / 80; // this is hard coded because i didnt want to pass another val :()
    for (let i = 0; i < 8; i++) {
        drawLineThickness(ctx, w, h, i, val);
    }
}

function drawLineThickness(ctx, w, h, index, amount = 1) {
    const resolution = 128;
    const val = Math.min(Math.max(amount * 8 - index, 0), 1);
    const windowWidth = 16 * (8 - index * amount);

    const barSpacing = w * 0.9 / 8;
    const barX = w * 0.05 + barSpacing * index;

    ctx.beginPath();

    for (let i = 0; i < resolution; i++) {
        const y = h * 0.05 + (h * 0.9 / resolution) * i;
        const p = i - (resolution - windowWidth);

        let k = 0;
        if (p >= 0 && p <= windowWidth) {
            k = 0.5 * (1 - Math.cos((Math.PI / windowWidth) * p)) * val;
        }
        const x = barX + k * w * 0.0625;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.lineTo(barX, h * 0.95);
    ctx.closePath();

    const grad = ctx.createLinearGradient(w/2, 0, w/2, h);
    grad.addColorStop(0.2, '#7e7e7e')
    grad.addColorStop(0.5, '#cccaca')
    grad.addColorStop(1, colB)

    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.strokeStyle = grad
    ctx.lineWidth = 4;
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.stroke();
}

