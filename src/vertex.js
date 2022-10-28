class Vertex {
  static FRICTION = 0.86;
  static EASE = 20;

  #orgY;
  #baseY;
  #vy;
  #fillSpeed;

  constructor(x, y, fillSpeed) {
    this.#orgY = y;
    this.x = x;
    this.#fillSpeed = -fillSpeed;

    this.reset();
  }

  reset = () => {
    this.#baseY = this.#orgY;
    this.y = this.#orgY;
    this.#vy = 0;
    this.targetWaveHeight = 0;
  };

  update = () => {
    this.#baseY += this.#fillSpeed;
    this.#vy += this.targetWaveHeight + this.#baseY - this.y;
    this.#vy = (this.#vy * Vertex.FRICTION) | 0;
    this.y += (this.#vy / Vertex.EASE) | 0;
  };
}

export default Vertex;
