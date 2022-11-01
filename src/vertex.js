class Vertex {
  static FRICTION = 0.93;
  static EASE = 0.08;

  #orgY;
  #vy;
  #fillSpeed;

  constructor(x, y, fillSpeed) {
    this.#orgY = y;
    this.x = x;
    this.#fillSpeed = -fillSpeed;

    this.reset();
  }

  reset = () => {
    this.baseY = this.#orgY;
    this.y = this.#orgY;
    this.#vy = 0;
    this.targetWaveHeight = 0;
  };

  update = () => {
    this.baseY += this.#fillSpeed;
    this.#vy += this.targetWaveHeight + this.baseY - this.y;
    this.#vy = this.#vy * Vertex.FRICTION;
    this.y += this.#vy * Vertex.EASE;
  };
}

export default Vertex;
