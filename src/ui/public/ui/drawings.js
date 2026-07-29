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

export function drawPitch(ctx, w, h, value = 0.5) {
    ctx.beginPath()
    for(let i = 0; i < 24; i++){
        const angle = Math.cos(Math.PI * value + (Math.PI / 24) * i)
        const xPos = w/2 + angle * w * 0.45
        ctx.arc(xPos - 0.5, h/2 - 0.5, 1, 0, Math.PI * 2, false);
    }
    ctx.fillStyle = 'white'
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(w * 0.05 + w * 0.9 * value, h * 0.15)
    ctx.lineTo(w * 0.05 + w * 0.9 * value, h * 0.85)
    ctx.strokeStyle = "white"
    ctx.stroke()
}


// reverb send
export function drawReverbSend(ctx, w, h, val = 0) {
    const heightPercentage = h / 80; // this is hard coded because i didnt want to pass another val :()
    for (let i = 0; i < 6; i++) {
        drawLineThickness(ctx, w, h, i, val);
    }
}

function drawLineThickness(ctx, w, h, index, amount = 1) {
    const resolution = 128;
    const val = Math.min(Math.max(amount * 6 - index, 0), 1);
    const windowWidth = 16 * (8 - index * amount);

    const barSpacing = w * 0.9 / 6;
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


    ctx.fillStyle = "white"
    ctx.fill();    
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2;
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.stroke();
}

// 

export function drawSkew(ctx, w, h, val = 0){
    const radius = w * 0.45 * (val * 0.75 + 0.25);

    ctx.beginPath();
    ctx.arc(w/2, h/2, radius, 0, Math.PI * 1.75)
    ctx.strokeStyle = 'white'
    ctx.stroke()

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.45, 0, Math.PI * 1.75)
    ctx.strokeStyle = 'white'
    ctx.stroke()

}

export function drawPosition(ctx, w, h, val = 0) {

}


// reverb size
export function drawReverbSize(ctx, w, h, val = 0) {
    const cx = w / 2;
    const cy = h / 2;
    const r = w * 0.35;

    ctx.lineJoin = "round"
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'grey';
    ctx.fillStyle = 'white';

    // back frame
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
        const j = i * 2 + 1;
        const angle = Math.PI / 2 + (Math.PI * 2 / 6) * j;
        const xPos = cx + Math.cos(angle) * r;
        const yPos = cy + Math.sin(angle) * r;
        ctx.moveTo(cx, cy);
        ctx.lineTo(xPos, yPos);
    }
    ctx.stroke();


    // side frame
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 6 + (Math.PI * 2 / 6) * i;
        const xPos = cx + Math.cos(angle) * r;
        const yPos = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
    }
    ctx.closePath();
    ctx.stroke();

    // inner fill
    ctx.beginPath();
    const innerR = r * 0.25 + r * val * 0.75;
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 6 + (Math.PI * 2 / 6) * i;
        const xPos = cx + Math.cos(angle) * innerR;
        const yPos = cy + Math.sin(angle) * innerR;
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
    }
    ctx.closePath();
    ctx.fill();

    // front frame
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
        const j = i * 2 + 1;
        const angle = Math.PI / 6 + (Math.PI * 2 / 6) * j;
        const xPos = cx + Math.cos(angle) * r;
        const yPos = cy + Math.sin(angle) * r;
        ctx.moveTo(cx, cy);
        ctx.lineTo(xPos, yPos);
    }
    ctx.lineJoin = "round"
    ctx.lineWidth = 1.5;

    ctx.stroke();
}


// reverb decay

export function drawReverbDecay(ctx, w, h, val = 0){
}



export function drawReverbDampening(ctx, w, h, val = 0){
    const cx = w/2
    const cy = h/2

    for(let i = 0; i < 8; i++){
        const angle = (Math.PI * 2/8) * i * val;

        ctx.moveTo(cx + Math.cos(angle) * w * 0.5)

        
    }
}




function drawReverbLevel(ctx, w, h, val = 0){

}