import { checkType, primitiveType } from './utils.js';

import Fluid from './fluid.js';
import WaterDropEffect from './waterDropEffect.js';
import BaseType from './BaseType.js';

export default class TypeFluid extends BaseType {
  #fillTime;
  #fluid;
  #waterDropEffect;
  #countToDropWater;
  #waterDrops = [];
  #targetWaveHeight;
  #pixelInfosKeys;
  #pixelHeightsList = {};
  #pixelAlphasList = {};
  #useWaterDropEffect;
  #maxWaterDropCount;

  constructor(
    elementId,
    fillTime = 5,
    useWaterDropEffect = true,
    maxWaterDropCount = 3
  ) {
    super(elementId, 'position');

    this.#typeCheck(fillTime, useWaterDropEffect, maxWaterDropCount);
    this.#fillTime = fillTime;
    this.#useWaterDropEffect = useWaterDropEffect;
    this.#maxWaterDropCount = maxWaterDropCount | 0;
    this.#countToDropWater = fillTime - 1;
    this.#targetWaveHeight = this.fittedRect.y;

    this.#fluid = new Fluid({
      fps: TypeFluid.FPS,
      stageSize: this.canvasSize,
      startPosY: this.fittedRect.y + this.fittedRect.height,
      fillTime: this.#fillTime,
    });
    this.#waterDropEffect = new WaterDropEffect(
      this.ctx,
      this.canvasSize,
      TypeFluid.FPS,
      parseInt(this.rootStyle.fontSize),
      this.#maxWaterDropCount
    );

    this.#initPixelInfosList(this.canvasSize);
  }

  #typeCheck(fillSpeed, useWaterDropEffect, maxWaterDropCount) {
    checkType(fillSpeed, primitiveType.number);
    checkType(useWaterDropEffect, primitiveType.boolean);
    checkType(maxWaterDropCount, primitiveType.number);

    if (fillSpeed <= 0) {
      throw new Error("'spreadSpeed' should be greater then 0.");
    }

    if (maxWaterDropCount <= 0) {
      throw new Error("'maxWaterDropCount' should be greater then 0.");
    }
  }

  onRestart = () => {
    this.#fluid.reset();
    this.#initPixelInfosList(this.canvasSize);
  };

  onResize = () => {
    this.#fluid.resize(this.canvasSize, this.fittedRect.height);
    this.#waterDropEffect.resize(this.canvasSize);
    this.#initPixelInfosList(this.canvasSize);
    this.#targetWaveHeight = this.fittedRect.y;
  };

  #initPixelInfosList = (stageSize) => {
    const pixelInfosList = this.getPixelInfosList(stageSize);

    this.#pixelHeightsList = pixelInfosList.heightsList;
    this.#pixelAlphasList = pixelInfosList.alphasList;
    this.#pixelInfosKeys = Object.keys(pixelInfosList.heightsList).map((x) =>
      parseInt(x)
    );
  };

  onDraw = () => {
    this.#checkToDropWater();
    this.#onDropWater();

    this.#fluid.update();
    this.#waterDropEffect.update();

    this.#drawText();
    this.#useWaterDropEffect && this.#waterDropEffect.draw();
  };

  onDrawFinish = () => {
    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    this.drawText();
  };

  isDrawFinished = () => {
    return this.#fluid.baseHeight < 0;
  };

  #checkToDropWater = () => {
    this.#countToDropWater = (this.#countToDropWater + 1) % this.#fillTime;

    if (this.#countToDropWater || this.#fluid.baseHeight < this.#targetWaveHeight) {
      return;
    } // prettier-ignore

    const dropWater = this.#waterDropEffect.drop();
    dropWater && this.#waterDrops.push(dropWater);
  };

  #onDropWater = () => {
    let waterDrop;

    for (let i = 0; i < this.#waterDrops.length; i++) {
      waterDrop = this.#waterDrops[i];
      if (this.#fluid.getHeightOnPosX(waterDrop.x) > waterDrop.posY) {
        continue;
      }

      this.#fluid.setDropPosX(waterDrop.x, waterDrop.weight);
      this.#waterDrops.splice(i, 1);
      waterDrop.reset();
    }
  };

  #drawText = () => {
    this.stageFill(0, 0, this.#fluid.maxHeight * this.canvasSize.width * 4);

    let waveHeight;
    let pixelHeightsOnPosX;
    let pixelHeight;
    let index;

    this.#pixelInfosKeys.forEach((x) => {
      waveHeight = this.#fluid.getHeightOnPosX(x);
      pixelHeightsOnPosX = this.#pixelHeightsList[x];

      for (let i = 0; i < pixelHeightsOnPosX.length; i++) {
        if (waveHeight > pixelHeightsOnPosX[i]) {
          continue;
        }

        for (let j = i; j < pixelHeightsOnPosX.length; j++) {
          pixelHeight = pixelHeightsOnPosX[j];
          index = x + pixelHeight * this.canvasSize.width;

          this.setPixelOnStage(index, this.#pixelAlphasList[x][j]);

          if (this.#fluid.maxHeight < pixelHeight) {
            pixelHeightsOnPosX.splice(j, 1);
            this.#pixelAlphasList[x].splice(j, 1);
          }
        }

        break;
      }
    });

    this.stageDraw();
  };
}
