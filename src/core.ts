export * from "./interpreter";

const screenSize: [number, number] = [480, 270];
const memorySize: number = 1024 * 1024 * 32; // 32MB
const memory: Uint8ClampedArray = new Uint8ClampedArray(memorySize);

const stepInterval: number = 1 / 60;
const maxSteps: number = 10;
let elapsedTime: number = 0;
let previousTime: DOMHighResTimeStamp = 0;
let shouldExit: boolean = false;

const canvas = document.querySelector("#app-canvas")! as HTMLCanvasElement;
canvas.width = screenSize[0];
canvas.height = screenSize[1];

const gfx = canvas.getContext("2d")!; //TODO handle errors
const screenPixels = gfx.createImageData(screenSize[0], screenSize[1]);

export function start() {
  shouldExit = false;
  requestAnimationFrame(update);
}

export function stop() {
  shouldExit = true;
}

//TODO pause when window hidden
export function update(ts: DOMHighResTimeStamp) {
  if (shouldExit) return;
  requestAnimationFrame(update);

  const dt = (ts - previousTime) * 0.001;
  elapsedTime += dt;

  // run fixed update steps
  const steps = Math.min(Math.floor(elapsedTime / stepInterval), maxSteps);
  for (let i = 0; i < steps; i++) {
    step();
  }

  // handle left-over elapsed time
  elapsedTime = elapsedTime - steps * stepInterval;
  if (elapsedTime >= stepInterval) elapsedTime = 0;

  // update canvas
  screenPixels.data.set(memory.slice(0, 4 * screenSize[0] * screenSize[1])); //TODO point to SCREEN mem slice
  gfx.putImageData(screenPixels, 0, 0);

  previousTime = ts;
}

function step() {
  paint(); //TEMP
}

let pixel = 3;
function paint() {
  memory[pixel] ^= 255;
  pixel += 4 * 25;
}
