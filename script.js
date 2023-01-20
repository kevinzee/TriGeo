const message = document.querySelector("#message");
const solution1 = document.querySelector("#solution1");
const solution2 = document.querySelector("#solution2");

const margin = 30;

const sideFields = document.querySelectorAll(".side");
for(const field of sideFields) {
  field.addEventListener('input', update);
}
const angleFields = document.querySelectorAll('.angle');
for(const field of angleFields) {
  field.addEventListener('input', update);
}

document.querySelector("#clear").addEventListener("click", () => {
  for(const field of sideFields) {
    field.value = undefined;
  }
  for(const field of angleFields) {
    field.value = undefined;
  }
  update();
});

function update() {
  const t = new Triangle();
  for(const field of sideFields) {
    const value = field.value ? Number(field.value) : undefined;
    t.sides[Number(field.dataset.index)] = value;
  }
  for(const field of angleFields) {
    const value = field.value ? Number(field.value) : undefined;
    t.angles[Number(field.dataset.index)] = value;
  }

  const sides = t.solvedSideCount();
  const angles = t.solvedAngleCount();
  if (sides + angles < 3) {
    noSolution("Not enough information!");
  } else if (sides + angles > 3) {
    noSolution("Too much information!");
  } else if (sides === 0) {
    noSolution("At least one side is required");
  } else {
    let solutions;
    try {
      solutions = t.solve();
    } catch (e) {
      console.error(e);
      noSolution('Invalid triangle! Try Again.');
      return;
    }
    showSolutions(solutions);
  }
}

function noSolution(text) {
  message.classList.remove("hidden");
  message.innerHTML = text;
  solution1.classList.add("hidden");
  solution2.classList.add("hidden");
}

function format(label, value) {
  return `<div>${label} = ${value.toFixed(3)}</div>`;
}

function showSolutions(solutions) {
  message.classList.add("hidden");
  showSolution(solution1, solutions[0]);
  if (solutions.length > 1) {    
    showSolution(solution2, solutions[1]);
  } else {
    solution2.classList.add("hidden");
  }
}

function showSolution(element, t) {
  element.classList.remove("hidden");
  drawTriangle(element.querySelector("canvas"), t);
  const perimeter = t.sides[0] + t.sides[1] + t.sides[2];
  const area = t.sides[0] * t.sides[1] * Math.sin(radians(t.angles[2])) / 2;
  
  const lines = [
    format('Angle A', t.angles[0]),
    format('Angle B', t.angles[1]),
    format('Angle C', t.angles[2]),
    '<hr>',
    format('Perimeter', perimeter),
    format('Area', area),
  ];
  element.querySelector(".details").innerHTML = lines.join('\n');
}

function drawTriangle(canvas, t) {
    const ctx = canvas.getContext("2d");

  const apexX = Math.cos(radians(t.angles[0])) * t.sides[1];
  const apexY = Math.sin(radians(t.angles[0])) * t.sides[1];
  const left = Math.min(0, apexX);
  const width = Math.max(t.sides[2], apexX) - left;
  const scaleX = (canvas.width - margin * 2) / width;
  const scaleY = (canvas.height - margin * 2) / apexY;
  const scale = Math.min(scaleX, scaleY);

  function toScreen(x, y) {
    return [
      margin + (x - left) * scale,
      margin + (apexY - y) * scale,    
    ];
  }
  
  const [ax, ay] = toScreen(0, 0);
  const [bx, by] = toScreen(t.sides[2], 0);
  const [cx, cy] = toScreen(apexX, apexY);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.lineWidth = 2.0;
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.stroke();

  ctx.font = "18px system-ui";
  ctx.fillStyle = "black";
  ctx.fillText("A", ax - 20, ay + 20);
  ctx.fillText("B", bx + 10, by + 20);
  ctx.fillText("C", cx - 5, cy - 10);

  labelSide(ctx, cx, cy, bx, by, t.sides[0], -4);  
  labelSide(ctx, ax, ay, cx, cy, t.sides[1], -4);  
  labelSide(ctx, ax, ay, bx, by, t.sides[2], 20);
}

function labelSide(ctx, x1, y1, x2, y2, value, vShift) {
  const label = value.toFixed(3);
  ctx.textAlign = "center";
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  ctx.translate(midX, midY);
  ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
  ctx.fillText(label, 0, vShift);
  ctx.setTransform();
}

update();