const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

// State
let drawing = false;
let strokes = [];
let currentStroke = [];
let history = [];
let redoStack = [];

// Tool state
let brushType = "pen";
let color = "#111";
let size = 3;

// UI bindings
document.getElementById("brush").onchange = e => brushType = e.target.value;
document.getElementById("color").onchange = e => color = e.target.value;
document.getElementById("size").oninput = e => size = e.target.value;
document.getElementById("canvasStyle").onchange = e => redrawAll(e.target.value);

// -------------------------
// Drawing logic
// -------------------------
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  currentStroke = [];
  saveState();

  currentStroke.push(createPoint(e));
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  currentStroke.push(createPoint(e));
  redrawTemp();
});

canvas.addEventListener("pointerup", () => {
  if (currentStroke.length > 0) {
    strokes.push(currentStroke);
  }
  drawing = false;
});

function createPoint(e) {
  return {
    x: e.offsetX,
    y: e.offsetY,
    color,
    size,
    brushType
  };
}

// -------------------------
// Rendering
// -------------------------
function redrawTemp() {
  redrawAll(document.getElementById("canvasStyle").value);
  drawStroke(currentStroke);
}

function redrawAll(style) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(style);

  strokes.forEach(stroke => drawStroke(stroke));
}

function drawStroke(stroke) {
  if (stroke.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(stroke[0].x, stroke[0].y);

  for (let i = 1; i < stroke.length; i++) {
    ctx.lineTo(stroke[i].x, stroke[i].y);
  }

  ctx.strokeStyle = stroke[0].color;
  ctx.lineWidth = stroke[0].size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (stroke[0].brushType === "marker") ctx.globalAlpha = 0.3;
  else if (stroke[0].brushType === "pencil") ctx.globalAlpha = 0.6;
  else ctx.globalAlpha = 1;

  ctx.stroke();
  ctx.globalAlpha = 1;
}

// -------------------------
// Optimize handwriting
// -------------------------
function optimizeHandwriting() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(document.getElementById("canvasStyle").value);

  strokes.forEach(stroke => smoothStroke(stroke));
}

function smoothStroke(stroke) {
  if (stroke.length < 3) {
    drawStroke(stroke);
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke[0].x, stroke[0].y);

  for (let i = 1; i < stroke.length - 2; i++) {
    const xc = (stroke[i].x + stroke[i + 1].x) / 2;
    const yc = (stroke[i].y + stroke[i + 1].y) / 2;
    ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
  }

  const last = stroke[stroke.length - 1];
  ctx.lineTo(last.x, last.y);

  ctx.strokeStyle = stroke[0].color;
  ctx.lineWidth = stroke[0].size * 0.9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

// -------------------------
// Undo / Redo
// -------------------------
function saveState() {
  history.push(JSON.stringify(strokes));
  redoStack = [];
}

function undo() {
  if (!history.length) return;
  redoStack.push(JSON.stringify(strokes));
  strokes = JSON.parse(history.pop());
  redrawAll(document.getElementById("canvasStyle").value);
}

function redo() {
  if (!redoStack.length) return;
  history.push(JSON.stringify(strokes));
  strokes = JSON.parse(redoStack.pop());
  redrawAll(document.getElementById("canvasStyle").value);
}

// -------------------------
// Export
// -------------------------
function saveImage(type) {
  const link = document.createElement("a");
  link.download = `handwritten.${type}`;
  link.href = canvas.toDataURL(`image/${type}`);
  link.click();
}

// -------------------------
// Backgrounds
// -------------------------
function drawBackground(type) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#e0e0e0";

  if (type === "lined") {
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  if (type === "grid") {
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
}

// Init
drawBackground("plain");
