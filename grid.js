const COLS = 50;
const ROWS = 10;

const grid = document.getElementById("grid");
const fragment = document.createDocumentFragment();

for (let i = 0; i < COLS * ROWS; i += 1) {
  const dot = document.createElement("div");
  dot.className = "dot";
  fragment.appendChild(dot);
}

grid.appendChild(fragment);

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function seedField() {
  particles.length = 0;
  const count = Math.floor((canvas.width * canvas.height) / 2800);

  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.35 + 0.04,
      gold: Math.random() > 0.35,
    });
  }
}

function drawField() {
  ctx.fillStyle = "#070605";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bands = 18;
  for (let i = 0; i < bands; i += 1) {
    const y = (canvas.height / bands) * i + Math.sin(i * 0.7) * 18;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 24) {
      const drift = Math.sin(x * 0.004 + i) * 22;
      ctx.lineTo(x, y + drift);
    }
    ctx.strokeStyle = `rgba(201, 160, 90, ${0.035 + (i % 5) * 0.008})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.gold
      ? `rgba(201, 160, 90, ${p.a})`
      : `rgba(255, 255, 255, ${p.a * 0.55})`;
    ctx.fill();
  });
}

resize();
seedField();
drawField();

window.addEventListener("resize", () => {
  resize();
  seedField();
  drawField();
});
