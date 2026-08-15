export const color = {
    pink: "#CB8B93", // og pink
    orange: "#E3895A", // og orange
    tan: "#BEDBBA", //"#2d2d2d"
    lighttan: "#CFE1CE",
    grey: "#3d3d3d",
    lightgrey: "#aaaaaa"
}

// color helpers
export const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgb = (c) => `#${c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

export const lerpColor = (hexA, hexB, t) => {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return rgb(a.map((v, i) => v + (b[i] - v) * t));
};

function withAlpha(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}



export function drawLock(ctx, w, h, val) {
    const cx = w * 0.5, cy = h * 0.5, r = w * 0.18;
    const unlocked = val ? 0 : h * 0.15;

    const grad = ctx.createLinearGradient(cx - w * 0.2, h / 2, cx + w * 0.2, h / 2)
    grad.addColorStop(0, color.pink);
    grad.addColorStop(1, color.lightgrey);

    ctx.beginPath();
    ctx.roundRect(w * 0.2, h * 0.48, w * 0.6, h * 0.38, 2);
    ctx.fillStyle = grad;
    ctx.fill();


    ctx.beginPath();
    ctx.moveTo(cx - r, cy - unlocked);
    ctx.lineTo(cx - r, h * 0.4 - unlocked);
    ctx.arc(cx, h * 0.4 - unlocked, r, Math.PI, 0);
    ctx.lineTo(cx + r, cy - unlocked);

    ctx.strokeStyle = grad;
    ctx.lineWidth = w * 0.07;
    ctx.lineCap = "round";
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

    ctx.strokeStyle = val == 1 ? color.lightgrey : color.grey;
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
    const cy = h / 2, iconSize = w * 0.9;

    const drawFreq = (freq, opacity) => {
        ctx.beginPath()
        ctx.moveTo(w * 0.05, h * 0.95);
        for (let i = 0; i <= 48; i++) {
            const xPos = w * 0.05 + (w * 0.9 / 48) * i;
            const amp = (h * 0.25 / freq)
            const yPos = cy + Math.sin((Math.PI * freq / 48) * i) * amp;

            ctx.lineTo(xPos, yPos)
        }
        ctx.lineTo(w * 0.95, h * 0.95);
        ctx.closePath()

        if (val) {
            const grad = ctx.createLinearGradient(w * 0.05, h / 2, w * 0.95, h / 2)
            grad.addColorStop(0, withAlpha(color.pink, opacity));
            grad.addColorStop(1, withAlpha(color.orange, opacity));
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = withAlpha(color.grey, opacity);
        }

        ctx.lineWidth = 1.5;
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.fill()
    }

    drawFreq(6, 1)
    drawFreq(4, 0.875)
    drawFreq(2, 0.75)
}

export function drawSelectDelay(ctx, w, h, val) {
    const cx = w / 2, cy = h / 2;

    for (let i = 0; i < 4; i++) {
        const radius = (w * 0.45 / 4) * (i + 1)
        ctx.beginPath();

        ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 0.25, false);

        if (val) {
            const grad = ctx.createLinearGradient(w * 0.05, h / 2, w * 0.95, h / 2)
            grad.addColorStop(0, color.pink);
            grad.addColorStop(0.5, color.tan);
            grad.addColorStop(1, color.orange);
            ctx.strokeStyle = grad;
        } else {
            ctx.strokeStyle = color.grey;
        }

        ctx.lineWidth = 1.5;
        ctx.lineCap = "round"
        ctx.stroke()
    }
}

function drawInput(){
    const canvas = document.getElementById("reverbAmt");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, w, h);
}


export function drawPitch(ctx, w, h, value = 0.5, aux = {}) {
    const { tapIndex = 0, state = true } = aux;

    const norm = Math.min(Math.max(tapIndex / 8, 0), 1);
    const invValue = 0.05 + (1 - value) * 0.9;

    const numDots = 32;
    const windowSize = 12 + 12 * Math.min(Math.abs(value - 0.5) - 0.3, 0);
    let yScale = Math.min(invValue * 2 - 1, 1);
    yScale = yScale === 0 ? 0.02 : yScale;
    const peakIndex = invValue * numDots;
    const halfWindow = windowSize / 2;
    const RES = 60;

    const ampAt = (i) => {
        const dist = Math.abs(i - peakIndex);
        const t = Math.min(dist / halfWindow, 1);
        const falloff = 0.5 * (1 + Math.cos(Math.PI * t));
        return 1 + (h * 0.5 - 1) * falloff;
    };
    const xThetaAt = (i) => {
        const theta = Math.PI * (i / (numDots - 1));
        return { x: w / 2 + Math.cos(theta) * w * 0.45, theta };
    };

    const baseColor = state ? lerpColor(color.pink, color.orange, norm) : color.grey;
    const gradCenter = (1 - Math.cos(Math.PI * value)) * 0.5;
    const grad = ctx.createRadialGradient(w * gradCenter, h / 2, 0, w * gradCenter, h / 2, w / 2);

    grad.addColorStop(0, state ? lerpColor(color.lightgrey, baseColor, 0.5) : lerpColor(color.lightgrey, color.grey, 0.5));
    grad.addColorStop(0.5, baseColor);
    grad.addColorStop(1, color.grey);

    ctx.beginPath();
    for (let i = 0; i < numDots; i++) {
        if (Math.abs(i - peakIndex) <= halfWindow) continue; // handled by the fill below
        const { x, theta } = xThetaAt(i);
        if (Math.sin(theta) <= 0) continue;
        const yOffset = ampAt(i);
        ctx.moveTo(x, h / 2 + yOffset * yScale);
        ctx.lineTo(x, h / 2);
    }
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = grad;
    ctx.stroke();

    const winStart = Math.max(peakIndex - halfWindow, 0);
    const winEnd = Math.min(peakIndex + halfWindow, numDots - 1);
    const pts = [];
    for (let s = 0; s <= RES; s++) {
        const i = winStart + (winEnd - winStart) * (s / RES);
        const { x, theta } = xThetaAt(i);
        if (Math.sin(theta) <= 0) continue;
        pts.push({ x, y: h / 2 + ampAt(i) * yScale });
    }
    if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, h / 2);
        for (const p of pts) ctx.lineTo(p.x, p.y);
        ctx.lineTo(pts[pts.length - 1].x, h / 2);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.stroke()
    }
}

// reverb send
export function drawReverbSend(ctx, w, h, val = 0, aux = {}) {
    const { tapIndex = 0, state = true } = aux;

    const norm = Math.min(Math.max(tapIndex / 8, 0), 1);
    const baseColor = state ? lerpColor(color.pink, color.orange, norm) : color.grey;

    const resolution = 128;

    for (let index = 0; index < 8; index++) {
        const lineVal = Math.min(Math.max(val * 8 - index, 0), 1);
        const windowWidth = 16 * (8 - index * val);

        const barSpacing = w * 0.9 / 8;
        const barX = w * 0.05 + barSpacing * index;

        ctx.beginPath();

        for (let i = 0; i < resolution; i++) {
            const y = h * 0.05 + (h * 0.9 / resolution) * i;
            const p = i - (resolution - windowWidth);

            let k = 0;
            if (p >= 0 && p <= windowWidth) {
                k = 0.5 * (1 - Math.cos((Math.PI / windowWidth) * p)) * lineVal;
            }
            const x = barX + k * w * 0.0625;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        const grad1 = ctx.createRadialGradient(w * 0.05, h * 0.95, 0, w * 0.05, h * 0.95, w);

        grad1.addColorStop(0, color.lightgrey);
        grad1.addColorStop(1, 'white');


        ctx.lineTo(barX, h * 0.95);
        ctx.closePath();

        const grad = ctx.createRadialGradient(w * 0.05, 
            h * 0.95 - h * 0.45 * val, 
            0, 
            w * 0.05, 
            h * 0.95 - h * 0.45 * val, 
            w * 0.05 + w * 0.9 * val);

        grad.addColorStop(0, lerpColor(state ? color.tan : color.lightgrey, baseColor, state ? 0 : 0.5));
        grad.addColorStop(0.15 + 0.25 * val, lerpColor(state ? color.tan : color.lightgrey, baseColor, 1));
        grad.addColorStop(1, color.grey);

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = grad;
        ctx.stroke();
    }
}

export function drawSkew(ctx, w, h, val = 0, aux = {}){
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

export function drawPosition(ctx, w, h, val = 0, aux = {}) {

}


// reverb size
export function drawReverbSize(ctx, w, h, val = 1, aux = {}) {
    const cx = w / 2;
    const cy = h / 2;
    const r = w * 0.35;

    ctx.lineJoin = "round"
    ctx.lineWidth = 1.5;

    const grad = ctx.createLinearGradient(w * 0.05, h / 2, w * 0.95, h / 2)
    grad.addColorStop(0.35, color.pink);
    grad.addColorStop(0.75, withAlpha(color.orange, 0.5));

    ctx.fillStyle = grad
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
    ctx.strokeStyle = "#333333"
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
    ctx.strokeStyle = "#666666"
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




export function drawReverbDampening(ctx, w, h, val = 0, aux = {}){
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
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

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
    const drawFilterResponse = (edge, knee, floor, isHP = true) => {
        ctx.beginPath();
        ctx.moveTo(edge, mid);
        ctx.lineTo(knee, mid);
        ctx.quadraticCurveTo(floor, mid, floor, bot);

        const c = isHP ? color.pink : color.orange;
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round'
        ctx.stroke();

        ctx.lineTo(isHP ? w * 0.95 : w * 0.05, bot)

        const grad = ctx.createRadialGradient(knee, mid, 0, knee, mid, w);
        grad.addColorStop(0, withAlpha(c, 0.5))
        grad.addColorStop(1, withAlpha(color.tan, 0))
        ctx.fillStyle = grad
        ctx.fill()
    };

    const kneeW = w * 0.2;
    const lpKnee = w * 0.05 + w * 0.7 * lp;
    drawFilterResponse(w * 0.05, lpKnee, lpKnee + kneeW, false);

    const hpKnee = w * 0.05 + w * 0.7 * hp;
    drawFilterResponse(w * 0.95, hpKnee, hpKnee - kneeW, true);

    ctx.restore();
}



export function drawReverbDecay(ctx, w, h, val = 1, aux = {}) {
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
        const clipped = Math.min(val * 7 + 1, i + 1);
        const radius = (w * 0.345 / 6) * (8 - clipped);

        ctx.beginPath();
        for (let j = 0; j <= 36; j++) {
            const angle = Math.PI / 2 + Math.PI / 36 * j
            const yPos = h * 0.75 + Math.cos(angle) * radius;
            let xPos = w * 0.2 + ((w * 0.6 / 7) * clipped);
            xPos += Math.sin(angle) * radius / 2;
    
            if (j === 0) { ctx.moveTo(xPos, yPos); }
            else { ctx.lineTo(xPos, yPos); }
        }

        const grad = ctx.createLinearGradient(w * 0.05, h/2, w * 0.95, h/2)
        grad.addColorStop(0, color.tan);
        grad.addColorStop(0.25, withAlpha(color.orange, 0.75));
        grad.addColorStop(1, withAlpha(color.pink, 0.25));
        ctx.strokeStyle = grad;
        ctx.lineCap = "round"
        ctx.lineWidth = 1.5
        ctx.stroke()
    }
}

export function drawDial(ctx, w, h, val = 0, aux = {}){
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

export function drawFeedback(ctx, w, h, val = 0, aux = {}){

    const baseColor = color.pink;
    const numLines = 48;
    const activeGrad = ctx.createLinearGradient(0, h/2, w * val, h/2)
    activeGrad.addColorStop(0, withAlpha(color.pink, val * 0.8 + 0.2))
    activeGrad.addColorStop(0.8, withAlpha(color.orange, val * 0.2 + 0.8))
    activeGrad.addColorStop(1, color.tan)

    const inactiveGrad = ctx.createLinearGradient(w * val, h / 2, w, h / 2)
    inactiveGrad.addColorStop(0, withAlpha(color.grey, 0.5))
    inactiveGrad.addColorStop(1, color.grey)


    const cy = h/2
    const value = Math.floor(val * numLines);

    for (let i = 0; i < numLines; i++){
        const xPos = w * 0.025 + (w * 0.95 / numLines) * i;
        const yPos = i > value ? h * 0.35 : h * 0.45;

        ctx.beginPath()
        ctx.moveTo(xPos, cy - yPos);
        ctx.lineTo(xPos, cy + yPos);
        ctx.strokeStyle = i > value ? inactiveGrad : i == value ? color.tan : activeGrad;
        ctx.lineWidth = i == value ? 2 : 1.5;
        ctx.lineCap = "round";
        ctx.stroke()
   }

    
}


export function drawSelectIO(ctx, w, h, val = 0) {
    const cx = w / 2, cy = h / 2, iconSize = w * 0.8;
    const spacing = iconSize / 4;
    const totalSpan = spacing * 3; // 4 lines, 3 gaps between them
    const yStart = cy + totalSpan / 2; // topmost-value line, shifted down to center the group

    for (let i = 0; i < 4; i++) {
        const x = { start: w * 0.1, end: w * 0.9, fader: w * 0.25 + w * 0.15 * i };
        const y = yStart - spacing * i;

        ctx.beginPath();
        ctx.moveTo(x.start, y);
        ctx.lineTo(x.end, y);

        ctx.strokeStyle = !val ? color.lightgrey : color.grey;
        ctx.lineCap = "round";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const faderSize = w * 0.1;
        ctx.roundRect((x.start + (iconSize / 4) * i), y - faderSize / 2, faderSize * 2, faderSize, 4);
        ctx.fillStyle = !val ? lerpColor(color.pink, color.orange, 0.25 * i) : color.grey;
        ctx.fill();
    }
}

export function drawFilterGraph(canvas, cutoff = 0.5, shape = 0) {
    // shape: 0 = lowpass, 0.5 = bandpass, 1 = highpass
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;

    const clamp = (t) => Math.min(1, Math.max(0, t));
    const lerp = (a, b, t) => a + (b - a) * t;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

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

    const s = clamp(shape);

    function rayToBoxDistance(ox, oy, dx, dy, xmin, xmax, ymin, ymax) {
        let t = Infinity;
        if (dx > 0) t = Math.min(t, (xmax - ox) / dx);
        else if (dx < 0) t = Math.min(t, (xmin - ox) / dx);
        if (dy > 0) t = Math.min(t, (ymax - oy) / dy);
        else if (dy < 0) t = Math.min(t, (ymin - oy) / dy);
        return t;
    }

    const xmin = w * 0.05, xmax = w * 0.95;
    const ymin = top, ymax = bot;

    const middleHeightOffset = (0.5 - Math.abs(s - 0.5)) * h / 2;
    const middle = {
        x: w * 0.2 + w * 0.7 * cutoff,
        y: mid - middleHeightOffset,
    };

    const lpToBp = Math.min(s * 2, 1) + 1;
    const bpToHp = Math.max(s * 2, 1) - 1;

    const leftAngle = Math.PI + (Math.PI * 0.3 * (1 - lpToBp));
    const rightAngle = Math.PI - (Math.PI * 0.3 * (1 - bpToHp));

    const dxL = Math.cos(leftAngle), dyL = Math.sin(leftAngle);
    const leftRadius = rayToBoxDistance(middle.x, mid, dxL, dyL, xmin, xmax, ymin, ymax);
    const left = { x: middle.x + dxL * leftRadius, y: mid + dyL * leftRadius };

    const dxR = -Math.cos(rightAngle), dyR = Math.sin(rightAngle);
    const rightRadius = rayToBoxDistance(middle.x, mid, dxR, dyR, xmin, xmax, ymin, ymax);
    const right = { x: middle.x + dxR * rightRadius, y: mid + dyR * rightRadius };

    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.quadraticCurveTo(middle.x, middle.y, right.x, right.y);

    const c = lerp(color.orange, color.pink, s); // adjust if color isn't lerp-able directly
    ctx.strokeStyle = c;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.lineTo(right.x, bot);
    ctx.lineTo(left.x, bot);
    ctx.closePath();

    const grad = ctx.createRadialGradient(middle.x, middle.y, 0, middle.x, middle.y, w);
    grad.addColorStop(0, withAlpha(c, 0.5));
    grad.addColorStop(1, withAlpha(color.tan, 0));
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
}


export function drawModDisplay(canvas, rate = 1, amp = 1) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width/dpr, h = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath()
    ctx.moveTo(w * 0.5, h * 0.05);
    ctx.lineTo(w * 0.5, h * 0.95);
    ctx.moveTo(w * 0.05, h * 0.5);
    ctx.lineTo(w * 0.95, h * 0.5);
    ctx.strokeStyle = color.grey;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round"
    ctx.stroke();

    ctx.beginPath()
    for(let i = 0; i < 128; i++){
        const xPos = w * 0.05 + (w * 0.9/128) * i;
        const angle = (Math.PI * 10 * rate / 128) * i;
        const yPos = h / 2 + Math.sin(angle) * h * 0.45 * amp;

        if (i === 0) { ctx.moveTo(xPos, yPos); }
        else { ctx.lineTo(xPos, yPos); }
    }

    const grad = ctx.createLinearGradient(0, h / 2 , w, h / 2);
    grad.addColorStop(0, withAlpha(color.pink, 1))
    grad.addColorStop(1, withAlpha(color.orange, 0.75))

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round"
    ctx.stroke();

    ctx.restore();
}
export function drawSlider(ctx, w, h, val = 0, aux = {}) {

    const baseColor = color.pink;
    const numLines = 16;

    const activeGrad = ctx.createLinearGradient(w / 2, h, w / 2, h - h * val)
    activeGrad.addColorStop(0, withAlpha(color.pink, val * 0.8 + 0.2))
    activeGrad.addColorStop(0.8, withAlpha(color.orange, val * 0.2 + 0.8))
    activeGrad.addColorStop(1, color.tan)

    const inactiveGrad = ctx.createLinearGradient(w / 2, h - h * val, w / 2, 0)
    inactiveGrad.addColorStop(0, withAlpha(color.grey, 0.5))
    inactiveGrad.addColorStop(1, color.grey)

    const cx = w / 2
    const value = Math.floor(val * numLines);

    for (let i = 0; i <= numLines; i++) {
        const yPos = h - (h * 0.1 + (h * 0.8 / numLines) * i);
        const xExt = w * 0.45

        ctx.beginPath()
        ctx.moveTo(cx - xExt, yPos);
        ctx.lineTo(cx + xExt, yPos);
        ctx.strokeStyle = i > value ? inactiveGrad : i == value ? color.tan : activeGrad;
        ctx.lineWidth = i == value ? 2 : 1.5;
        ctx.lineCap = "round";
        ctx.stroke()
    }
}