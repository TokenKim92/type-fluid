import { WEIGHT } from './utils.js';
import Vertex from './vertex.js';

class Fluid {
  static VERTEX_INTERVAL = 5;
  static MAX_EFFECT_RANGE = 5;
  static MAX_EFFECT_RANGE_OFFSET = 12;
  static WAVE_STEP = 7;

  #stageSize;
  #ctx;
  #vertexCount;
  #vertexes = [];
  #droppedVertexIndex;
  #fps;
  #fillTime;
  #fillSpeed;
  #initWaveHeight = {
    hight: 100,
    middle: 100,
    low: 100,
  };
  #waveArray = [];
  #count = 0;
  #temp = 0;

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
    const START_POS_OFFSET = -100;

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

    this.calculateWaveHeights();

    this.tempFunction();
  };

  calculateWaveHeights = () => {
    const arr = [];
    const amplitudeOffset = 20;
    arr.push(amplitudeOffset);
    for (let i = 1; i < this.#vertexCount; i++) {
      const x = i / 4;
      arr.push((amplitudeOffset * Math.sin(x)) / (x * 1.3));
    }

    let sign = 1;
    let offset = 0.4;
    let temp = 1;

    for (let i = Fluid.WAVE_STEP; i > 0; i--) {
      for (let j = 0; j < 2 * i - 1; j++) {
        let num = (i - Math.abs(j - (i - 1))) * sign * temp;
        const tempArr = arr.map((height) => height * num);
        this.#waveArray.push(tempArr);
      }
      sign *= -1;
      temp *= offset;
    }
  };

  tempFunction = () => {
    const n = 7;
    const arr = [];
    let sign = 1;
    let offset = 1;
    let temp = 1;

    for (let i = 1; i <= n; i++) {
      for (let j = 0; j < 2 * i - 1; j++) {
        let num = (i - Math.abs(j - (i - 1))) * sign * temp;

        arr.push(num);
      }
      sign *= -1;
      temp *= offset;
    }
    console.log(arr);
  };

  update = () => {
    const curVertex = this.#vertexes[this.#droppedVertexIndex];

    curVertex.targetWaveHeight = this.#waveArray[this.#count][0]; //curVertex.targetWaveHeight / Fluid.WAVE_STEP;

    this.#ctx.fillRect(curVertex.x, curVertex.y, 2, 2);
    this.#count = (this.#count + 1) % (Fluid.WAVE_STEP * Fluid.WAVE_STEP);

    this.#setWaveHeightLeftSide();
    this.#setWaveHeightLRightSide();

    this.#vertexes.forEach((vertex) => vertex.update());
  };

  #setWaveHeightLeftSide = () => {
    let effectIndex = 0;
    let effectRatio;
    let curVertex;
    let prevVertex = this.#vertexes[this.#droppedVertexIndex];
    let count = 1;

    for (let i = this.#droppedVertexIndex - 1; i > 0; i--) {
      curVertex = this.#vertexes[i];
      // effectRatio =
      //   effectIndex++ > Fluid.MAX_EFFECT_RANGE
      //     ? Fluid.MAX_EFFECT_RANGE / Fluid.MAX_EFFECT_RANGE_OFFSET
      //     : effectIndex / Fluid.MAX_EFFECT_RANGE_OFFSET;
      // curVertex.targetWaveHeight =
      //   effectRatio * curVertex.targetWaveHeight +
      //   (1 - effectRatio) * prevVertex.targetWaveHeight;
      // prevVertex = curVertex;
      curVertex.targetWaveHeight = this.#waveArray[this.#count][count++];
    }
  };

  #setWaveHeightLRightSide = () => {
    let effectIndex = 0;
    let effectRatio;
    let curVertex;
    let prevVertex = this.#vertexes[this.#droppedVertexIndex];
    let count = 1;

    for (let i = this.#droppedVertexIndex + 1; i < this.#vertexCount; i++) {
      curVertex = this.#vertexes[i];
      // effectRatio =
      //   effectIndex++ > Fluid.MAX_EFFECT_RANGE
      //     ? Fluid.MAX_EFFECT_RANGE / Fluid.MAX_EFFECT_RANGE_OFFSET
      //     : effectIndex / Fluid.MAX_EFFECT_RANGE_OFFSET;
      // curVertex.targetWaveHeight =
      //   effectRatio * curVertex.targetWaveHeight +
      //   (1 - effectRatio) * prevVertex.targetWaveHeight;
      // prevVertex = curVertex;
      curVertex.targetWaveHeight = this.#waveArray[this.#count][count++];
    }
  };

  setDropPosX = (posX, weight) => {
    const adjustedPosX = this.#stageSize.width / 2;
    //posX < this.#stageSize.width ? posX : this.#stageSize.width;

    this.#droppedVertexIndex = (adjustedPosX / Fluid.VERTEX_INTERVAL) | 0;
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

  get baseHeight() {
    return this.#vertexes[0].baseY;
  }
}

export default Fluid;
