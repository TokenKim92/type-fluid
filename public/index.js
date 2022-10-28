import TypeFluid from '../src/typeFluid.js';

const type = new TypeFluid('type', 50000, {
  waveHeight: 1,
  rippleSpeed: 5,
});
type.start();
