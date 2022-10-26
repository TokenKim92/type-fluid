class Vertex {
  static FRICTION = 0.86;
  static EASE = 0.1;

  #orgY;
  #vy;

  constructor(x, y) {
    this.#orgY = y;
    this.x = x;
    this.reset();
  }

  reset = () => {
    this.baseY = this.#orgY;
    this.y = this.#orgY;
    this.#vy = 0;
    this.targetWaveHeight = 0;
  };

  update = () => {
    const dy = this.targetWaveHeight + this.baseY - this.y;
    this.#vy += dy;
    this.#vy *= Vertex.FRICTION;
    this.y += this.#vy * Vertex.EASE;
  };
}

export default Vertex;
