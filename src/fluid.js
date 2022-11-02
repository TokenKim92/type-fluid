import { WEIGHT, TARGET_WAVE_HEIGHT } from './utils.js';
import Vertex from './vertex.js';

class Fluid {
  static VERTEX_INTERVAL = 3;
  static MAX_EFFECT_RANGE = 5;
  static MAX_EFFECT_RANGE_OFFSET = 20;
  static WAVE_STEP = 6;

  #stageSize;
  #vertexCount;
  #vertexes = [];
  #droppedIndex;
  #fps;
  #fillTime;
  #fillSpeed;
  #maxHeight;

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

    this.#droppedIndex = 0;
    this.#stageSize = stageSize;
    this.#vertexCount = (stageSize.width / Fluid.VERTEX_INTERVAL) | 0;
    console.log(this.#vertexCount);
    this.#vertexes = [];
    this.#fillSpeed = bottomPos / (this.#fillTime * this.#fps);
    this.#maxHeight = stageSize.height;

    const startPosY = bottomPos + START_Y_OFFSET;
    for (let i = 0; i < this.#vertexCount; i++) {
      this.#vertexes.push(
        new Vertex(Fluid.VERTEX_INTERVAL * i, startPosY, this.#fillSpeed)
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
    // left side
    let curVertex;
    let prevVertex = this.#vertexes[this.#droppedIndex];
    let effectRatio;
    let effectIndex = 0;
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

    // right side
    effectIndex = 0;
    prevVertex = this.#vertexes[this.#droppedIndex];
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
        ? (x / Fluid.VERTEX_INTERVAL) | 0
        : (this.#stageSize.width / Fluid.VERTEX_INTERVAL) | 0;

    const curVertex = this.#vertexes[this.#droppedIndex];
    curVertex.targetWaveHeight = TARGET_WAVE_HEIGHT[weight];

    const curMaxHeight = curVertex.calculateMaxHeight(
      TARGET_WAVE_HEIGHT[WEIGHT.heavy]
    );
    this.#maxHeight =
      this.#maxHeight < curMaxHeight ? this.maxHeight : curMaxHeight;
    this.#maxHeight |= 0;
  };

  get curHeight() {
    return this.#vertexes[this.#droppedIndex].y;
  }

  get baseHeight() {
    return this.#vertexes[0].baseY;
  }

  getHeight(x) {
    return this.#vertexes[(x / Fluid.VERTEX_INTERVAL) | 0].y;
  }

  get maxHeight() {
    return this.#maxHeight;
  }
}

export default Fluid;
