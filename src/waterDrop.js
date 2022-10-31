class WaterDrop {
  static MIN_RADIUS = 5;
  static MAX_RADIUS = 8;
  static RADIUS_OFFSET = WaterDrop.MAX_RADIUS - WaterDrop.MIN_RADIUS;
  static PI2 = Math.PI * 2;

  #sizeOffset;
  #stageSize;
  #acceleration;
  #velocity;
  #speed;
  #initSpeed;

  constructor(stageSize, initSpeed, dropAcceleration) {
    this.#initSpeed = initSpeed;
    this.#acceleration = dropAcceleration;

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
  /*
  draw2 = (ctx) => {
    ctx.beginPath();

    ctx.ellipse(
      -2.3 * this.#sizeOffset + this.x,
      3.9 * this.#sizeOffset + this.y,
      2 * this.#sizeOffset,
      0.5 * this.#sizeOffset,
      Math.PI * 1.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      1.7 * this.#sizeOffset + this.x,
      4.5 * this.#sizeOffset + this.y,
      2 * this.#sizeOffset,
      0.5 * this.#sizeOffset,
      -Math.PI * 1.3,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      4.5 * this.#sizeOffset + this.x,
      2 * this.#sizeOffset + this.y,
      1.5 * this.#sizeOffset,
      0.5 * this.#sizeOffset,
      -Math.PI * 1.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };
*/
  reset = () => {
    this.#sizeOffset =
      (Math.random() * WaterDrop.RADIUS_OFFSET + WaterDrop.MIN_RADIUS) | 0;

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
}

export default WaterDrop;
