import { WEIGHT, HIGH_WAVE_HEIGHT, LOW_WAVE_HEIGHT } from './utils.js';
import Vertex from './vertex.js';

class Fluid {
  static MAX_VERTEX_COUNT = 400;
  static MAX_EFFECT_RANGE = 5;
  static MAX_EFFECT_RANGE_OFFSET = 20;
  static WAVE_STEP = 6;

  #vertexes = [];
  #vertexCount;
  #vertexInterval;
  #stageSize;
  #fps;
  #fillTime;
  #fillSpeed;
  #maxHeight;
  #initWaveHeight;
  #droppedIndex;

  constructor(initAttribute) {
    this.#fps = initAttribute.fps;
    this.#fillTime = initAttribute.fillTime;

    this.resize(initAttribute.stageSize, initAttribute.startPosY);
  }

  reset = () => {
    this.#vertexes.forEach((vertex) => vertex.reset());
  };

  resize = (stageSize, bottomPos) => {
    const START_Y_OFFSET = 5;

    if (stageSize.width < Fluid.MAX_VERTEX_COUNT) {
      this.#vertexCount = stageSize.width;
      this.#initWaveHeight = LOW_WAVE_HEIGHT;
    } else {
      this.#vertexCount = Fluid.MAX_VERTEX_COUNT;
      this.#initWaveHeight = HIGH_WAVE_HEIGHT;
    }

    this.#droppedIndex = 0;
    this.#stageSize = stageSize;
    this.#vertexInterval = stageSize.width / this.#vertexCount;
    this.#vertexes = [];
    this.#fillSpeed = bottomPos / (this.#fillTime * this.#fps);
    this.#maxHeight = stageSize.height;

    const startPosY = bottomPos + START_Y_OFFSET;
    for (let i = 0; i < this.#vertexCount; i++) {
      this.#vertexes.push(
        new Vertex(this.#vertexInterval * i, startPosY, this.#fillSpeed)
      );
    }
  };

  update = () => {
    const curVertex = this.#vertexes[this.#droppedIndex];
    curVertex.targetWaveHeight = curVertex.targetWaveHeight / Fluid.WAVE_STEP;
    this.#setSideWaveHeight();

    this.#vertexes.forEach((vertex) => vertex.update());
  };

  #setSideWaveHeight = () => {
    let curVertex;
    let prevVertex = this.#vertexes[this.#droppedIndex];
    let effectRatio;
    let effectIndex = 0;
    // left side
    for (let i = this.#droppedIndex - 1; i > 0; i--) {
      curVertex = this.#vertexes[i];

      effectRatio =
        effectIndex++ > Fluid.MAX_EFFECT_RANGE
          ? Fluid.MAX_EFFECT_RANGE / Fluid.MAX_EFFECT_RANGE_OFFSET
          : effectIndex / Fluid.MAX_EFFECT_RANGE_OFFSET;

      curVertex.targetWaveHeight =
        effectRatio * curVertex.targetWaveHeight +
        (1 - effectRatio) * prevVertex.targetWaveHeight;

      prevVertex = curVertex;
    }

    effectIndex = 0;
    prevVertex = this.#vertexes[this.#droppedIndex];
    // right side
    for (let i = this.#droppedIndex + 1; i < this.#vertexCount; i++) {
      curVertex = this.#vertexes[i];

      effectRatio =
        effectIndex++ > Fluid.MAX_EFFECT_RANGE
          ? Fluid.MAX_EFFECT_RANGE / Fluid.MAX_EFFECT_RANGE_OFFSET
          : effectIndex / Fluid.MAX_EFFECT_RANGE_OFFSET;

      curVertex.targetWaveHeight =
        effectRatio * curVertex.targetWaveHeight +
        (1 - effectRatio) * prevVertex.targetWaveHeight;

      prevVertex = curVertex;
    }
  };

  setDropPosX = (x, weight) => {
    this.#droppedIndex =
      x < this.#stageSize.width
        ? (x / this.#vertexInterval) | 0
        : this.#vertexCount - 1;

    const curVertex = this.#vertexes[this.#droppedIndex];
    curVertex.targetWaveHeight = this.#initWaveHeight[weight];

    const curMaxHeight = curVertex.calculateMaxHeight(
      this.#initWaveHeight[WEIGHT.heavy]
    );
    this.#maxHeight =
      this.#maxHeight < curMaxHeight ? this.maxHeight : curMaxHeight;
    this.#maxHeight |= 0;
  };

  getHeightOnPosX(x) {
    return this.#vertexes[(x / this.#vertexInterval) | 0].y;
  }

  get curHeight() {
    return this.#vertexes[this.#droppedIndex].y;
  }

  get baseHeight() {
    return this.#vertexes[0].baseY;
  }

  get maxHeight() {
    return this.#maxHeight;
  }
}

export default Fluid;
