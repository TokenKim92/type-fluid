import { checkType, primitiveType } from './utils.js';

import Fluid from './fluid.js';
import WaterDropEffect from './waterDropEffect.js';
import BaseType from './BaseType.js';

export default class TypeFluid extends BaseType {
  static INIT_WAVE_HEIGHT = 1;
  static INIT_RIPPLE_SPEED = 5;

  #fillTime;
  #fluid;
  #waterDropEffect;
  #countToDropWater;
  #waterDrops = [];
  #targetWaveHeight;
  #pixelInfosList;
  #pixelInfosKeys;
  #pixelHeightsList = {};
  #pixelAlphasList = {};
  #maxWaterDropCount;

  constructor(elementId, fillTime = 5, maxWaterDropCount = 3) {
    super(elementId);
    this.#typeCheck(fillTime, maxWaterDropCount);

    this.#fillTime = fillTime;
    this.#maxWaterDropCount = maxWaterDropCount | 0;
    this.#countToDropWater = fillTime - 1;

    this.#fluid = new Fluid({
      fps: TypeFluid.FPS,
      stageSize: this.canvasSize,
      startPosY: this.stageRect.height,
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

  #typeCheck(fillSpeed, maxWaterDropCount) {
    checkType(fillSpeed, primitiveType.number);
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
    this.#resetPixelInfosList();
  };

  onResize = () => {
    this.#fluid.resize(this.canvasSize, this.stageRect.height);
    this.#waterDropEffect.resize(this.canvasSize);
    this.#initPixelInfosList(this.canvasSize);
    this.#targetWaveHeight = this.stageRect.y;
  };

  #initPixelInfosList = (stageSize) => {
    this.#pixelInfosList = this.getPixelInfosList(stageSize);
    this.#pixelInfosKeys = Object.keys(this.#pixelInfosList.posList).map((x) =>
      parseInt(x)
    );

    this.#resetPixelInfosList();
  };

  #resetPixelInfosList = () => {
    const pixelHeightsList = this.#pixelInfosList.posList;
    const pixelAlphasList = this.#pixelInfosList.alphaList;

    this.#pixelInfosKeys.forEach((key) => {
      this.#pixelHeightsList[key] = [...pixelHeightsList[key]];
      this.#pixelAlphasList[key] = [...pixelAlphasList[key]];
    });
  };

  onDraw = () => {
    this.#checkToDropWater();
    this.#onDropWater();

    this.#fluid.update();
    this.#waterDropEffect.update();

    this.#drawText();
    this.#waterDropEffect.draw();
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
