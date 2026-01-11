const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

let drawing = false;
let history = [];
let redoStack = [];

let brushType = "pen";
let color = "#111";
let size = 3;

document.getElementById("brush").onchange = e => brushType = e.target.value;
document.getElementById("color").onchange = e => color = e.target.value;
document.getElementById("size").oninput = e => size = e.target.value;
document.getElementById("canvasStyle").onchange = e => drawBackground(e.target.value);

function saveState() {
  history.push(canvas.toDataURL());
  redoStack = [];
}

canvas.addEventListener("pointerdown", e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
  saveState();
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;

  if (brushType === "marker") ctx.globalAlpha = 0.3;
  else if (brushType === "pencil") ctx.globalAlpha = 0.6;
  else ctx.globalAlpha = 1;

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  ctx.globalAlpha = 1;
});

function undo() {
  if (!history.length) return;
  redoStack.push(canvas.toDataURL());
  const img = new Image();
  img.src = history.pop();
  img.onload = () => ctx.drawImage(img, 0, 0);
}

function redo() {
  if (!redoStack.length) return;
  const img = new Image();
  img.src = redoStack.pop();
  img.onload = () => ctx.drawImage(img, 0, 0);
}

function saveImage(type) {
  const link = document.createElement("a");
  link.download = `handwritten.${type}`;
  link.href = canvas.toDataURL(`image/${type}`);
  link.click();
}

function drawBackground(type) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

// init
drawBackground("plain");
