import Vertex from './vertex.js';
import { DIGIT_OFFSET, MS_TO_S_OFFSET } from './utils.js';

class Fluid {
  static MAX_EFFECT_RANGE = 15;
  static MAX_EFFECT_RANGE_OFFSET = 45;
  static WAVE_STEP = 3;

  #stageSize;
  #ctx;
  #vertexCount;
  #vertexes = [];
  #dropPosX;
  #droppedVertexIndex;
  #countToDrop = 0;
  #color;
  #fps;
  #fillTime;
  #fillSpeed;
  #initWaveHeight;

  constructor(kernelOption, userOption) {
    this.#ctx = kernelOption.context;
    this.#color = kernelOption.color;
    this.#fps = kernelOption.fps;
    this.#fillTime = userOption.fillTime;

    const WAVE_HEIGHT_OFFSET = 500;
    this.#initWaveHeight = userOption.waveHeight * WAVE_HEIGHT_OFFSET * DIGIT_OFFSET; // prettier-ignore

    this.resize(kernelOption.stageSize, kernelOption.startPosY);
    this.#drop();
  }

  reset = () => {
    this.#countToDrop = 0;
    this.#vertexes.forEach((vertex) => {
      vertex.reset();
    });
    this.#drop();
  };

  resize = (stageSize, bottomPos) => {
    const VERTEX_INTERVAL = 10;
    const START_POS_OFFSET = 5;

    this.#stageSize = stageSize;
    this.#vertexCount = Math.ceil(stageSize.width / (VERTEX_INTERVAL - 2));
    this.#vertexes = [];
    this.#fillSpeed = ((bottomPos / ((this.#fillTime / MS_TO_S_OFFSET) * this.#fps)) * DIGIT_OFFSET) | 0; // prettier-ignore

    const startPoxX = VERTEX_INTERVAL / 2;
    const startPosY = (bottomPos + START_POS_OFFSET) * DIGIT_OFFSET;
    for (let i = 0; i < this.#vertexCount; i++) {
      this.#vertexes.push(
        new Vertex(VERTEX_INTERVAL * i - startPoxX, startPosY, this.#fillSpeed)
      );
    }
  };

  update = () => {
    this.#countToDrop = (this.#countToDrop + 1) % this.#fps;
    this.#countToDrop || this.#drop();

    const curVertex = this.#vertexes[this.#droppedVertexIndex];
    curVertex.targetWaveHeight =
      (curVertex.targetWaveHeight / Fluid.WAVE_STEP) | 0;

    this.#setWaveHeightLeftSide();
    this.#setWaveHeightLRightSide();

    this.#vertexes.forEach((vertex) => vertex.update());
  };

  #setWaveHeightLeftSide = () => {
    let effectIndex = 0;
    let effectRatio;
    let curVertex;
    let prevVertex = this.#vertexes[this.#droppedVertexIndex];

    for (let i = this.#droppedVertexIndex - 1; i > 0; i--) {
      curVertex = this.#vertexes[i];
      effectRatio =
        effectIndex++ > Fluid.MAX_EFFECT_RANGE
          ? Fluid.MAX_EFFECT_RANGE / Fluid.MAX_EFFECT_RANGE_OFFSET
          : effectIndex / Fluid.MAX_EFFECT_RANGE_OFFSET;

      curVertex.targetWaveHeight =
        (effectRatio * curVertex.targetWaveHeight + (1 - effectRatio) * prevVertex.targetWaveHeight) | 0; // prettier-ignore

      prevVertex = curVertex;
    }
  };

  #setWaveHeightLRightSide = () => {
    let effectIndex = 0;
    let effectRatio;
    let curVertex;
    let prevVertex = this.#vertexes[this.#droppedVertexIndex];

    for (let i = this.#droppedVertexIndex + 1; i < this.#vertexCount; i++) {
      curVertex = this.#vertexes[i];
      effectRatio =
        effectIndex++ > Fluid.MAX_EFFECT_RANGE
          ? Fluid.MAX_EFFECT_RANGE / Fluid.MAX_EFFECT_RANGE_OFFSET
          : effectIndex / Fluid.MAX_EFFECT_RANGE_OFFSET;

      curVertex.targetWaveHeight =
        (effectRatio * curVertex.targetWaveHeight + (1 - effectRatio) * prevVertex.targetWaveHeight) | 0; // prettier-ignore

      prevVertex = curVertex;
    }
  };

  #drop = () => {
    this.#dropPosX = this.#stageSize.width / 2;
    Math.random() * this.#stageSize.width;
    this.#droppedVertexIndex =
      (this.#vertexCount * (this.#dropPosX / this.#stageSize.width)) | 0;

    this.#vertexes[this.#droppedVertexIndex].targetWaveHeight =
      this.#initWaveHeight;
  };

  draw = () => {
    this.#ctx.save();

    this.#ctx.fillStyle = this.#color;
    this.#ctx.clearRect(0, 0, this.#stageSize.width, this.#stageSize.height);

    this.#ctx.beginPath();

    this.#ctx.moveTo(0, this.#stageSize.height);
    this.#vertexes.forEach((vertex) => {
      this.#ctx.lineTo(vertex.x, vertex.y / DIGIT_OFFSET);
    });
    this.#ctx.lineTo(this.#stageSize.width, this.#stageSize.height);
    this.#ctx.fill();

    this.#ctx.restore();
  };
}

export default Fluid;
