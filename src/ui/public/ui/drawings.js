const colA = '#9a8240' // faint tan
const colB = '#54865f' // faint orange
const colC = '#40677d' // pink
const colD = '#848b93' // almost red

const rgb = (c) => `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;

const lerp = (a, b, t) => { return a * t + b * (1 - t); }

export function drawLock(ctx, w, h, val) {
    const color = 'white'
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

export function drawTapState(ctx, w, h, val){

    const startAngle = Math.PI * 1.25;
    const endAngle = Math.PI * 1.75;

    ctx.strokeStyle = val == 0 ? 'white' : 'grey';
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    ctx.beginPath()
    ctx.arc(w/2, h/2, w * 0.25, startAngle, endAngle, true)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(w / 2, h * 0.35)
    ctx.lineTo(w / 2, h * 0.45)
    ctx.stroke()
}

export function drawSelectReverb(ctx, w, h, val) {

}

export function drawSelectDelay(ctx, w, h, val) {

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

    ctx.fillStyle = "white"
    ctx.fill();    
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1.5;
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
    const innerR = r * 0.25 + r * val * 0.55;
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

export function drawReverbTone(canvas, lp = 1, hp = 1) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const mid = h * 0.5, top = h * 0.1, bot = h * 0.9;

    // gridlines
    ctx.strokeStyle = "grey";
    for (let i = 0; i < 6; i++) {
        const x = w * 0.05 + w * 0.9 * Math.pow(i / 6, 0.4);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bot);
        ctx.stroke();
    }

    // filter response
    const drawFilterResponse = (edge, knee, floor) => {
        ctx.beginPath();
        ctx.moveTo(edge, mid);
        ctx.lineTo(knee, mid);
        ctx.quadraticCurveTo(floor, mid, floor, bot);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    const kneeW = w * 0.2;
    const lpKnee = w * 0.05 + w * 0.7 * lp;
    drawFilterResponse(w * 0.05, lpKnee, lpKnee + kneeW);

    const hpKnee = w * 0.05 + w * 0.7 * hp;
    drawFilterResponse(w * 0.95, hpKnee, hpKnee - kneeW);
}



export function drawReverbDecay(ctx, w, h, val = 0) {
    // dots 
    for(let i = 0; i < 12; i++){
        let xPos = w * 0.1 + ((w * 0.8 / 12) * i);

        ctx.beginPath()
        ctx.arc(xPos, h * 0.8, 1, 0, Math.PI * 2, true)
        ctx.fillStyle = 'grey';
        ctx.fill()
    }

    // arcs
    for (let i = 0; i < 7; i++) {
        const clipped = Math.min(val * 7 + 1, 7 - i);
        const radius = (w * 0.345 / 6) * clipped;

        ctx.beginPath();
        for (let j = 0; j < 36; j++) {
            const yPos = h * 0.75 + Math.cos(Math.PI / 2 + (Math.PI / 36) * j) * radius;
            let xPos = w * 0.05 + ((w * 0.6 / 7) * clipped);
            xPos += Math.sin(Math.PI / 2 + (Math.PI / 36) * j) * radius / 2;
            if (j === 0) { ctx.moveTo(xPos, yPos); }
            else { ctx.lineTo(xPos, yPos); }
        }

        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}

export function drawDial(ctx, w, h, val = 0){
    const cx = w/2, cy = h/2;

    const startAngle = Math.PI * 0.75;
    const angle = startAngle + Math.PI * 1.5 * val;

    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.45, startAngle, startAngle + Math.PI * 1.5, false);
    ctx.strokeStyle = 'white'
    ctx.stroke()

    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.375, 0, Math.PI * 2, true);
    ctx.fillStyle = 'white'
    ctx.fill()

    const xPos = cx + Math.cos(angle) * w * 0.3;
    const yPos = cy + Math.sin(angle) * w * 0.3;
    ctx.beginPath();
    ctx.arc(xPos, yPos, 2, 0, Math.PI * 2, true);
    ctx.fillStyle = 'black'
    ctx.fill()
}

export function drawFeedback(ctx, w, h, val = 0){
    const cx = w / 2, cy = h / 2;
    const numDots = 64;

    for (let i = 0; i < numDots * val; i++){
        const xPos = cx + Math.cos(Math.PI * 0.5 + (Math.PI * 8 / numDots) * i) * w * 0.35;
        let yPos = h * 0.25 + ((h * 0.75 / numDots) * i) 
        yPos += Math.sin(Math.PI * 0.5 + (Math.PI * 8 / numDots) * i);

        ctx.beginPath();
        ctx.arc(xPos, yPos, 1.5, 0, Math.PI * 2, true);
        const a = Math.cos((Math.PI * 8 / numDots) * i) * 0.35 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`
        ctx.fill()
    }
}