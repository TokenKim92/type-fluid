import { WEIGHT, DROP_SPEED } from './utils.js';
class WaterDrop {
  static MAX_SIZE_OFFSET = 3;

  #sizeOffset;
  #stageSize;
  #acceleration;
  #velocity;
  #speed;
  #initSpeed;
  #weight;
  #minSize;
  #maxSize;

  constructor(stageSize, minSize, dropAcceleration) {
    this.#minSize = minSize;
    this.#maxSize = minSize + WaterDrop.MAX_SIZE_OFFSET;
    this.#acceleration = dropAcceleration;
    this.#weight = WEIGHT.mild;
    this.#initSpeed = DROP_SPEED[this.#weight];

    this.resize(stageSize);
    this.reset();
  }

  resize = (stageSize) => {
    this.#stageSize = stageSize;
  };

  update = () => {
    if (!this.#speed) {
      return;
    }

    this.#isOutOfStage && this.reset();

    if (this.y > -this.#sizeOffset) {
      this.#velocity += this.#acceleration;
      this.#speed += this.#velocity;
    }

    this.y += this.#speed;
  };

  draw = (ctx) => {
    if (!this.#speed) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo(this.x, this.y);
    // This numbers should be constant and not changed
    ctx.quadraticCurveTo(
      0.2 * this.#sizeOffset + this.x,
      1 * this.#sizeOffset + this.y,
      0.75 * this.#sizeOffset + this.x,
      2 * this.#sizeOffset + this.y
    );
    ctx.quadraticCurveTo(
      1.3 * this.#sizeOffset + this.x,
      3 * this.#sizeOffset + this.y,
      1.5 * this.#sizeOffset + this.x,
      4 * this.#sizeOffset + this.y
    );
    ctx.quadraticCurveTo(
      1.7 * this.#sizeOffset + this.x,
      5.4 * this.#sizeOffset + this.y,
      this.x,
      5.5 * this.#sizeOffset + this.y
    );
    ctx.quadraticCurveTo(
      -1.7 * this.#sizeOffset + this.x,
      5.4 * this.#sizeOffset + this.y,
      -1.5 * this.#sizeOffset + this.x,
      4 * this.#sizeOffset + this.y
    );
    ctx.quadraticCurveTo(
      -1.3 * this.#sizeOffset + this.x,
      3 * this.#sizeOffset + this.y,
      -0.75 * this.#sizeOffset + this.x,
      2 * this.#sizeOffset + this.y
    );
    ctx.quadraticCurveTo(
      -0.2 * this.#sizeOffset + this.x,
      this.#sizeOffset + this.y,
      this.x,
      this.y
    );

    ctx.fill();
  };

  reset = () => {
    this.#sizeOffset = (Math.random() * WaterDrop.MAX_SIZE_OFFSET + this.#minSize) | 0; // prettier-ignore
    this.#weight = this.#getWeight(this.#sizeOffset);
    this.#initSpeed = DROP_SPEED[this.#weight];
    this.x =
      (Math.random() * (this.#stageSize.width - this.#sizeOffset) +
        this.#sizeOffset / 2) |
      0;
    this.y = -this.#sizeOffset * 5.5;
    this.#velocity = 0;
    this.#speed = 0;
  };

  drop = () => {
    this.#speed = this.#initSpeed;
  };

  #getWeight = (size) => {
    switch (size) {
      case this.#minSize:
        return WEIGHT.light;
      case this.#maxSize - 1:
        return WEIGHT.heavy;
      default:
        return WEIGHT.mild;
    }
  };

  get #isOutOfStage() {
    return this.y > this.#stageSize.height + this.#sizeOffset;
  }

  get isDropping() {
    return this.#speed !== 0;
  }

  get posY() {
    // This number should be constant and not changed
    return 5.5 * this.#sizeOffset + this.y;
  }

  get weight() {
    return this.#weight;
  }
}

export default WaterDrop;
