# type-fluid

A project to show how many animation effects can be shown in HTML5.

A library of type effects that animate text in windows.

This project includes a webpack config file to package this project into a library for easier use.( use `npm run build` or `npm run build-prod` )

## How to use

This is really all you need to get going.

```html
<h1 id="type">London</h1>
```

```js
import TypeFluid from './src/TypeFluid.js';

new TypeFluid('type').start();
```

You need to write your text in plain HTML tags with id and insert it as a parameter of your TypeFill class.

It has three main functions: `start()`, `stop()` and `restart()`.

As the name suggests. This is a function to start, stop and restart animations.

## Parameter of class

`TypeFluid(elementId, fillTime, useWaterDropEffect, maxWaterDropCount)`

1. `elementId`: the id of html tag ( Any ID can be used )
2. `fillTime`: time required to animate text. The type is `Number` and it is a seconds.( Not millisecond ) The default is `5` seconds.
2. `useWaterDropEffect`: a `boolean` type to decide whether or not to use the water drop effect. The default is `true`.
3. `maxWaterDropCount`: the number of simultaneously falling water drops. The default is `3`.

for example

```js
const type = new TypeFluid('type', 30, false);
```

## Used tools

- JavaScript

This is a pure JavaScript library with no other libraries. So you don't need to install any other libraries to use or contribute to this project.

## Overview

Take a look at this site to see how to animate as a example.

https://tokenkim92.github.io/type-fluid/
