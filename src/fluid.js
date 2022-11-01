import { WEIGHT } from './utils.js';
import Vertex from './vertex.js';

class Fluid {
  static VERTEX_INTERVAL = 5;
  static MAX_EFFECT_RANGE = 15;
  static MAX_EFFECT_RANGE_OFFSET = 100;
  static WAVE_STEP = 5;

  #stageSize;
  #ctx;
  #vertexCount;
  #vertexes = [];
  #droppedVertexIndex;
  #fps;
  #fillTime;
  #fillSpeed;
  #initWaveHeight = {
    hight: 1800,
    middle: 1400,
    low: 1000,
  };

  constructor(initAttribute) {
    this.#ctx = initAttribute.context;
    this.#fps = initAttribute.fps;
    this.#fillTime = initAttribute.fillTime;

    this.resize(initAttribute.stageSize, initAttribute.startPosY);
  }

  reset = () => {
    this.#vertexes.forEach((vertex) => vertex.reset());
  };

  resize = (stageSize, bottomPos) => {
    const START_POS_OFFSET = 5;

    this.#droppedVertexIndex = 0;
    this.#stageSize = stageSize;
    this.#vertexCount = Math.ceil(
      stageSize.width / (Fluid.VERTEX_INTERVAL - 2)
    );

    this.#vertexes = [];
    this.#fillSpeed = bottomPos / (this.#fillTime * this.#fps);

    const startPoxX = Fluid.VERTEX_INTERVAL / 2;
    const startPosY = bottomPos + START_POS_OFFSET;
    for (let i = 0; i < this.#vertexCount; i++) {
      this.#vertexes.push(
        new Vertex(
          Fluid.VERTEX_INTERVAL * i - startPoxX,
          startPosY,
          this.#fillSpeed
        )
      );
    }
  };

  update = () => {
    const curVertex = this.#vertexes[this.#droppedVertexIndex];
    curVertex.targetWaveHeight = curVertex.targetWaveHeight / Fluid.WAVE_STEP;

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

  setDropPosX = (posX, weight) => {
    this.#droppedVertexIndex = (posX / Fluid.VERTEX_INTERVAL) | 0;
    this.#vertexes[this.#droppedVertexIndex].targetWaveHeight =
      this.#getTargetWaveHeight(weight);
  };

  draw = () => {
    this.#ctx.beginPath();
    this.#ctx.moveTo(0, this.#stageSize.height);
    this.#vertexes.forEach((vertex) => this.#ctx.lineTo(vertex.x, vertex.y));
    this.#ctx.lineTo(this.#stageSize.width, this.#stageSize.height);
    this.#ctx.fill();
  };

  #getTargetWaveHeight = (weight) => {
    switch (weight) {
      case WEIGHT.heavy:
        return this.#initWaveHeight.hight;
      case WEIGHT.light:
        return this.#initWaveHeight.low;
      case WEIGHT.mild:
      default:
        return this.#initWaveHeight.middle;
    }
  };

  get curHeight() {
    return this.#vertexes[this.#droppedVertexIndex].y;
  }
}

export default Fluid;
