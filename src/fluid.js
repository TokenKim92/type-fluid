import Vertex from './vertex.js';

class Fluid {
  static VERTEX_COUNT = 500;
  static MIN_WAVE_HEIGHT = 15;
  static START_POS_OFFSET = 5;

  #stageSize;
  #ctx;
  #vertexes = [];
  #dropPosX;
  #droppedVertexIndex;
  #vertexInterval;
  #countToDrop = 0;
  #color;
  #fps;
  #fillSpeed;
  #initWaveHeight;
  #rippleSpeed;

  constructor(kernelOption, userOption) {
    this.#ctx = kernelOption.context;
    this.#color = kernelOption.color;
    this.#fps = kernelOption.fps;
    this.#fillSpeed = kernelOption.startPosY / ((userOption.fillTime / 1000) * this.#fps); // prettier-ignore
    this.#initWaveHeight = userOption.waveHeight;
    this.#rippleSpeed = userOption.rippleSpeed;

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

  resize = (stageSize, startPosY) => {
    this.#stageSize = stageSize;
    this.#vertexes = [];
    this.#vertexInterval = stageSize.width / Fluid.VERTEX_COUNT;

    for (let i = 0; i < Fluid.VERTEX_COUNT; i++) {
      this.#vertexes.push(
        new Vertex(this.#vertexInterval * i, startPosY + Fluid.START_POS_OFFSET)
      );
    }
  };

  update = () => {
    this.#countToDrop = (this.#countToDrop + 1) % this.#fps;
    this.#countToDrop || this.#drop();

    this.#vertexes.forEach((vertex) => {
      vertex.baseY -= this.#fillSpeed;
    });
    this.#vertexes[this.#droppedVertexIndex].targetWaveHeight *=
      this.#rippleSpeed;

    this.#setWaveHeightLeftSide();
    this.#setWaveHeightLRightSide();

    for (let i = 0; i < this.#vertexes.length; i++) {
      this.#vertexes[i].update();
    }

    this.#draw();
  };

  #setWaveHeightLeftSide = () => {
    let waveHeight;

    for (let i = this.#droppedVertexIndex - 1; i > 0; i--) {
      waveHeight = this.#droppedVertexIndex - i;
      waveHeight > Fluid.MIN_WAVE_HEIGHT &&
        (waveHeight = Fluid.MIN_WAVE_HEIGHT);
      this.#vertexes[i].targetWaveHeight -=
        (this.#vertexes[i].targetWaveHeight -
          this.#vertexes[i + 1].targetWaveHeight) *
        (1 - 0.01 * waveHeight);
    }
  };

  #setWaveHeightLRightSide = () => {
    let waveHeight;

    for (let i = this.#droppedVertexIndex + 1; i < Fluid.VERTEX_COUNT; i++) {
      waveHeight = i - this.#droppedVertexIndex;
      if (waveHeight > Fluid.MIN_WAVE_HEIGHT)
        waveHeight = Fluid.MIN_WAVE_HEIGHT;
      this.#vertexes[i].targetWaveHeight -=
        (this.#vertexes[i].targetWaveHeight -
          this.#vertexes[i - 1].targetWaveHeight) *
        (1 - 0.01 * waveHeight);
    }
  };

  #drop = () => {
    this.#dropPosX = Math.random() * this.#stageSize.width;
    this.#droppedVertexIndex = Math.floor(
      Fluid.VERTEX_COUNT * (this.#dropPosX / this.#stageSize.width)
    );

    this.#vertexes[this.#droppedVertexIndex].targetWaveHeight =
      this.#initWaveHeight;
  };

  #draw = () => {
    this.#ctx.save();
    this.#ctx.fillStyle = this.#color;
    this.#ctx.clearRect(0, 0, this.#stageSize.width, this.#stageSize.height);

    this.#ctx.beginPath();
    this.#ctx.moveTo(0, window.innerHeight);
    this.#vertexes.forEach((vertex) => this.#ctx.lineTo(vertex.x, vertex.y));
    this.#ctx.lineTo(this.#stageSize.width, window.innerHeight);
    this.#ctx.fill();

    this.#ctx.restore();
  };
}

export default Fluid;
