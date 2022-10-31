import WaterDrop from './waterDrop.js';

class WaterDropEffect {
  static WATER_DROP_COUNT = 3;

  #ctx;
  #waterDrops = [];
  #curIndex = 0;

  constructor(ctx, stageSize, fps) {
    const initSpeed = 0.5;
    this.#ctx = ctx;
    const dropAcceleration =
      (2 * (stageSize.height - fps * initSpeed)) / (fps * fps);

    for (let i = 0; i < WaterDropEffect.WATER_DROP_COUNT; i++) {
      this.#waterDrops.push(
        new WaterDrop(stageSize, initSpeed, dropAcceleration)
      );
    }
  }

  update = () => {
    this.#waterDrops.forEach((waterDrop) => waterDrop.update());
  };

  draw = () => {
    this.#waterDrops.forEach((waterDrop) => waterDrop.draw(this.#ctx));
  };

  resize = (stageSize) => {
    this.#waterDrops.forEach((waterDrop) => waterDrop.resize(stageSize));
  };

  drop = () => {
    const waterDrop = this.#waterDrops[this.#curIndex];
    this.#curIndex = (this.#curIndex + 1) % WaterDropEffect.WATER_DROP_COUNT;

    if (waterDrop.isDropping) {
      return undefined;
    }
    waterDrop.drop();

    return waterDrop;
  };
}

export default WaterDropEffect;
