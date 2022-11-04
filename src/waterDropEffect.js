import WaterDrop from './waterDrop.js';

class WaterDropEffect {
  static WATER_DROP_COUNT = 3;

  #ctx;
  #waterDrops = [];
  #curIndex = 0;

  constructor(ctx, stageSize, fps, fontSize) {
    this.#ctx = ctx;

    const INIT_SPEED = 0.5;
    const waterDropMinSize = (1 + fontSize / 100) | 0;
    const dropAcceleration =
      (2 * (stageSize.height - fps * INIT_SPEED)) / (fps * fps);

    for (let i = 0; i < WaterDropEffect.WATER_DROP_COUNT; i++) {
      this.#waterDrops.push(
        new WaterDrop(stageSize, INIT_SPEED, waterDropMinSize, dropAcceleration)
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
    this.#curIndex = (this.#curIndex + 1) % WaterDropEffect.WATER_DROP_COUNT;

    if (waterDrop.isDropping) {
      return undefined;
    }
    waterDrop.drop();

    return waterDrop;
  };
}

export default WaterDropEffect;
