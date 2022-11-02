class Vertex {
  static FRICTION = 0.93;
  static EASE = 0.08;

  #orgX;
  #orgY;
  #vy;
  #fillSpeed;

  constructor(x, y, fillSpeed) {
    this.#orgY = y;
    this.#orgX = x;
    this.x = x;
    this.#fillSpeed = -fillSpeed;

    this.reset();
  }

  reset = () => {
    this.baseY = this.#orgY;
    this.y = this.#orgY;
    this.x = this.#orgX;
    this.#vy = 0;
    this.targetWaveHeight = 0;
  };

  update = () => {
    // this.baseY += this.#fillSpeed;
    // this.#vy += this.targetWaveHeight + this.baseY - this.y;
    // this.#vy = this.#vy * Vertex.FRICTION;
    // this.y += this.#vy * Vertex.EASE;
    //this.x += 2;
    this.y = this.baseY + this.targetWaveHeight;
  };
}

export default Vertex;
