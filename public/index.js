import TypeFluid from '../src/typeFluid.js';

const type = new TypeFluid('type', 5000, {
  waveHeight: 1,
  rippleSpeed: 3,
});
type.start();

setTimeout(() => {
  type.restart();
}, 6000);
