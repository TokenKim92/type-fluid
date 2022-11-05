import WaterDrop from './waterDrop.js';

class WaterDropEffect {
  #ctx;
  #waterDrops = [];
  #curIndex = 0;
  #maxWaterDropCount;

  constructor(ctx, stageSize, fps, fontSize, maxWaterDropCount) {
    this.#ctx = ctx;
    this.#maxWaterDropCount = maxWaterDropCount;

    const INIT_SPEED = 0.5;
    const waterDropMinSize = (1 + fontSize / 100) | 0;
    const dropAcceleration =
      (2 * (stageSize.height - fps * INIT_SPEED)) / (fps * fps);

    for (let i = 0; i < this.#maxWaterDropCount; i++) {
      this.#waterDrops.push(
        new WaterDrop(stageSize, waterDropMinSize, dropAcceleration)
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
    this.#curIndex = 0;
    this.#waterDrops.forEach((waterDrop) => waterDrop.resize(stageSize));
  };

  drop = () => {
    const waterDrop = this.#waterDrops[this.#curIndex];
    this.#curIndex = (this.#curIndex + 1) % this.#maxWaterDropCount;

    if (waterDrop.isDropping) {
      return undefined;
    }
    waterDrop.drop();

    return waterDrop;
  };
}

export default WaterDropEffect;
