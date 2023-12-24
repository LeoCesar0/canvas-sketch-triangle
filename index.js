const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const Color = require("canvas-sketch-util/color");
const risoColors = require("riso-colors");

const settings = {
  dimensions: [1080, 1080],
  // animate: true,
  fps: 60,
};

const sketch = ({ context, width, height }) => {
  const colors = [random.pick(risoColors), random.pick(risoColors)];
  const bgColor = random.pick(colors).hex;
  let i = 0;

  context.fillStyle = bgColor;
  context.fillRect(0, 0, width, height);

  // --------------------------
  // RECT CONFIG
  // --------------------------
  const angle = -30;
  let x = 200;
  let y = 200;

  const numOfRects = 50;

  const maxWidth = width * 0.8;
  const minWidth = 600;
  const maxHeight = 120;
  const minHeight = 50;

  let lastCoords = null;

  const rects = new Array(numOfRects).fill().map((item) => {
    const fill = random.pick(colors).hex;
    const stroke = random.pick(colors).hex;
    const blend = random.value() > 0.4 ? "overlay" : "source-over";
    const rectOffset = 100;

    let w = random.range(minWidth, maxWidth);
    let h = random.range(minHeight, maxHeight);
    let x = random.range(-600, width);
    let y = random.range(100, height + 200);

    lastCoords = { x, y };

    return {
      x: x,
      y: y,
      w: w,
      h: h,
      fill: fill,
      stroke: stroke,
      blend: blend,
    };
  });

  const mask = {
    x: width / 2,
    y: height / 2,
    radius: width * 0.4,
    sides: 3,
    color: random.pick(colors).hex,
    lineWidth: 20,
  };

  return ({ context, width, height }) => {
    // --------------------------
    // DRAW TRIANGLE MASK
    // --------------------------

    context.save();

    context.translate(mask.x, mask.y);

    drawPolygon({ context, radius: mask.radius, sides: mask.sides });

    context.stroke();
    context.clip();

    context.translate(-mask.x, -mask.y);

    // --------------------------
    // SKEWED RECT
    // --------------------------

    rects.forEach((rect) => {
      const { x, y, w, h, fill, stroke, blend } = rect;

      const shadowColor = Color.offsetHSL(fill, 0, 0, -20);

      context.save();

      context.translate(x, y);

      context.strokeStyle = stroke;
      context.fillStyle = fill;
      context.lineWidth = 10;

      context.globalCompositeOperation = blend;

      drawSkewedRect({
        width: w,
        height: h,
        deg: angle,
        context: context,
      });

      context.shadowColor = Color.style(shadowColor.rgba);
      context.shadowOffsetX = -10;
      context.shadowOffsetY = 20;

      context.fill();

      context.shadowColor = null;

      context.stroke();

      context.globalCompositeOperation = "source-over";

      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.stroke();

      context.restore();
    });

    context.save();

    context.translate(mask.x, mask.y);

    context.globalCompositeOperation = "color-burn";
    drawPolygon({ context, radius: mask.radius, sides: mask.sides });

    context.lineWidth = mask.lineWidth;
    context.strokeStyle = "rgba(0,0,0,0.6)";
    context.stroke();

    context.strokeStyle = "rgba(0,0,0,0.4)";
    context.lineWidth = mask.lineWidth / 2;
    drawPolygon({ context, radius: mask.radius / 2, sides: mask.sides });
    context.stroke();

    context.restore();

    i++;
  };
};

canvasSketch(sketch, settings);

const drawSkewedRect = ({ context, width = 600, height = 200, deg = 30 }) => {
  let angle = math.degToRad(deg);

  let rx = Math.cos(angle) * width;
  let ry = Math.sin(angle) * width;

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + height);
  context.lineTo(0, height);
  context.lineTo(0, 0);
};

// const drawPolygon = ({context, radius = 100, sides = 3}) => {
//   context.beginPath();
//   for (let i = 0; i < sides; i++) {
//     const angle = (i / sides) * Math.PI * 2;
//     const x = radius * Math.sin(angle);
//     const y = radius * Math.cos(angle);
//     context.lineTo(x, y);
//   }
//   context.closePath();
// }

const drawPolygon = ({ context, radius = 100, sides = 3 }) => {
  context.beginPath();
  const slice = (Math.PI * 2) / sides;

  context.moveTo(0, -radius);

  for (let i = 1; i < sides; i++) {
    const angle = slice * i - Math.PI * 0.5;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    context.lineTo(x, y);
  }

  context.closePath();
};
