import * as Interpreter from "./interpreter";

export * from "./interpreter";

const size: [number, number] = [480, 270];
const memorySize: number = 1024 * 1024 * 64; // 32MB

const memBuffer = new ArrayBuffer(memorySize);
const _memory = new Uint32Array(memBuffer);

//TODO offset to SCREEN mem slice
const screen = new Uint8ClampedArray(memBuffer, 0, 4 * size[0] * size[1]);

const stepInterval: number = 1 / 60;
const maxSteps: number = 10;
let elapsedTime: number = 0;
let previousTime: DOMHighResTimeStamp = 0;
let shouldExit: boolean = false;

const canvas = document.querySelector("#app-canvas")! as HTMLCanvasElement;
canvas.width = size[0];
canvas.height = size[1];

const gfx = canvas.getContext("2d")!; //TODO handle errors
const screenPixels = gfx.createImageData(size[0], size[1]);

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
  screenPixels.data.set(screen);
  gfx.putImageData(screenPixels, 0, 0);

  previousTime = ts;
}

export function memory(): Uint32Array {
  return _memory;
}

function step() {
  Interpreter.execute();
}
