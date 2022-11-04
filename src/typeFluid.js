import TextFrame from './textFrame.js';
import {
  checkType,
  primitiveType,
  colorToRGB,
  parseIntForPadding,
  parseIntForMargin,
} from './utils.js';

import Fluid from './fluid.js';
import WaterDropEffect from './waterDropEffect.js';

class TypeFluid {
  static FPS = 60;
  static FPS_TIME = (1000 / TypeFluid.FPS) | 0;
  static COUNT_TO_DROP = TypeFluid.FPS / 2;
  static OPACITY_TRANSITION_TIME = 300;
  static INIT_WAVE_HEIGHT = 1;
  static INIT_RIPPLE_SPEED = 5;

  #canvas;
  #ctx;
  #backgroundCanvas = undefined;
  #backgroundCtx;
  #rootElement;
  #elementObj;
  #text;
  #stopFillTimer;
  #textFrame;
  #backgroundSize;
  #fillTime;
  #fontRGB;
  #rootStyle;
  #isProcessing = false;
  #canvasContainer;
  #isInitialized = false;
  #fluid;
  #pixelInfosList;
  #pixelInfosKeys;
  #waterDropEffect;
  #countToDrop = TypeFluid.COUNT_TO_DROP - 1;
  #waterDrops = [];
  #targetWaveHeight;

  #imageData;

  constructor(elementId, fillTime = 5) {
    this.#typeCheck(elementId, fillTime);

    this.#fillTime = fillTime;
    this.#text = this.#elementObj.innerText;
    this.#rootStyle = window.getComputedStyle(this.#elementObj);
    this.#fontRGB = colorToRGB(this.#rootStyle.color);

    this.#createRootElement();
    setTimeout(
      () => this.#initAfterTextDisappears(),
      TypeFluid.OPACITY_TRANSITION_TIME * 1.1
    );

    window.addEventListener('resize', this.#resize);
  }

  start = () => {
    if (!this.#isProcessing) {
      this.#setFillTimer();
      this.#isProcessing = true;
    }
  };

  stop = () => {
    if (this.#isProcessing) {
      this.#stopFillTimer();
      this.#isProcessing = false;
    }
  };

  restart = () => {
    this.#isProcessing && this.#stopFillTimer();

    this.#isProcessing = true;
    this.#fluid.reset();

    this.#setFillTimer();
  };

  #typeCheck(elementId, fillSpeed) {
    checkType(elementId, primitiveType.string);
    checkType(fillSpeed, primitiveType.number);

    this.#elementObj = document.querySelector(`#${elementId}`);
    if (!this.#elementObj) {
      throw new Error("This element id doesn't exit.");
    }

    if (fillSpeed <= 0) {
      throw new Error("'spreadSpeed' should be greater then 0.");
    }
  }

  #createRootElement = () => {
    this.#rootElement = document.createElement('div');
    this.#elementObj.parentElement.insertBefore(
      this.#rootElement,
      this.#elementObj
    );
    this.#rootElement.append(this.#elementObj);

    this.#rootElement.style.position = 'relative';
    this.#elementObj.style.transition = `opacity ${TypeFluid.OPACITY_TRANSITION_TIME}ms ease-out`;
    setTimeout(() => {
      this.#elementObj.style.opacity = 0;
    }, 1);
  };

  #createCanvases = () => {
    const createCanvasContainer = () => {
      this.#canvasContainer = document.createElement('div');
      this.#canvasContainer.style.transform =
        this.#rootStyle.display !== 'inline'
          ? this.#rootStyle.transform
          : 'matrix(1, 0, 0, 1, 0, 0)';
      this.#canvasContainer.style.top = `-${
        this.#backgroundSize.height + margin.top + margin.bottom
      }px`;
      this.#canvasContainer.style.position = 'relative';
    };

    const createBackgroundCanvas = () => {
      this.#backgroundCanvas = document.createElement('canvas');
      this.#backgroundCtx = this.#backgroundCanvas.getContext('2d');
      this.#backgroundCanvas.style.cssText = `
        left: ${margin.left}px;
        top: ${margin.top}px;
      `;
      this.#resetBackground();
      this.#backgroundCanvas.style.position = 'absolute';
    };

    const createCanvas = () => {
      this.#canvas = document.createElement('canvas');
      this.#ctx = this.#canvas.getContext('2d', { willReadFrequently: true });
      this.#canvas.style.position = 'absolute';
      this.#canvas.style.top = `${padding.top + margin.top}px`;
    };

    const padding = parseIntForPadding(this.#rootStyle.padding);
    const margin = parseIntForMargin(this.#rootStyle.margin);
    const toBeCreatedBackground =
      colorToRGB(this.#rootStyle.backgroundColor).a !== 0;
    this.#backgroundSize = this.#getClientSize(this.#elementObj);

    createCanvasContainer();
    if (toBeCreatedBackground) {
      createBackgroundCanvas();
      this.#canvasContainer.append(this.#backgroundCanvas);
    }
    createCanvas();
    this.#canvasContainer.append(this.#canvas);
    this.#rootElement.append(this.#canvasContainer);
  };

  #initAfterTextDisappears = () => {
    this.#createCanvases();
    this.#textFrame = new TextFrame(
      this.#ctx,
      this.#rootStyle,
      this.#text,
      this.#fontRGB.a
    );

    this.#resetStage();

    const stageSize = {
      width: this.#canvas.width,
      height: this.#canvas.height,
    };
    this.#pixelInfosList = this.#textFrame.getPixelPositions(stageSize);
    this.#pixelInfosKeys = Object.keys(this.#pixelInfosList).map((x) =>
      parseInt(x)
    );

    this.#fluid = new Fluid({
      fps: TypeFluid.FPS,
      stageSize: stageSize,
      startPosY: this.#textFrame.bottomPos,
      fillTime: this.#fillTime,
    });

    this.#waterDropEffect = new WaterDropEffect(
      this.#ctx,
      stageSize,
      TypeFluid.FPS,
      parseInt(this.#rootStyle.fontSize)
    );

    this.#isInitialized = true;
  };

  #resize = () => {
    const newBackgroundSize = this.#getClientSize(this.#elementObj);
    const isResized = newBackgroundSize.height !== this.#backgroundSize.height;
    const gap = newBackgroundSize.width - this.#backgroundSize.width;

    this.#backgroundSize = newBackgroundSize;
    this.#backgroundCanvas && this.#resetBackground();

    if (!isResized) {
      const adjustedGap =
        this.#rootStyle.textAlign === 'center' ? gap / 2 : gap;

      if (this.#rootStyle.textAlign === 'end' || this.#rootStyle.textAlign === 'center') {
        const prevLeft = parseInt(this.#canvas.style.left);
        this.#canvas.style.left = `${prevLeft + adjustedGap}px`;
      } // prettier-ignore

      return;
    }

    const margin = parseIntForMargin(this.#rootStyle.margin);
    this.#canvasContainer.style.top = `-${
      newBackgroundSize.height + margin.top + margin.bottom
    }px`;

    this.#resetStage();
    const stageSize = {
      width: this.#canvas.width,
      height: this.#canvas.height,
    };
    this.#pixelInfosList = this.#textFrame.getPixelPositions(stageSize);
    this.#pixelInfosKeys = Object.keys(this.#pixelInfosList).map((x) =>
      parseInt(x)
    );
    this.#fluid.resize(stageSize, this.#textFrame.bottomPos);
    this.#waterDropEffect.resize(stageSize);

    this.restart();
  };

  #resetStage = () => {
    const clientSize = this.#getClientSize(this.#elementObj);
    this.#canvas.width = clientSize.width;
    this.#canvas.height = clientSize.height;

    const textFrameRect = this.#textFrame.getRect(clientSize);
    this.#canvas.style.left = `${textFrameRect.x}px`;
    this.#canvas.width = textFrameRect.width;
    this.#canvas.height = textFrameRect.height;
    this.#ctx.fillStyle = this.#rootStyle.color;

    this.#targetWaveHeight = textFrameRect.y;

    this.#imageData = this.#ctx.getImageData(
      0,
      0,
      this.#canvas.width,
      this.#canvas.height
    );
  };

  #resetBackground = () => {
    this.#backgroundCanvas.width = this.#backgroundSize.width;
    this.#backgroundCanvas.height = this.#backgroundSize.height;

    this.#backgroundCtx.fillStyle = this.#rootStyle.backgroundColor;
    this.#backgroundCtx.fillRect(
      0,
      0,
      this.#backgroundSize.width,
      this.#backgroundSize.height
    );
  };

  #setFillTimer = () => {
    const intervalId = setInterval(() => {
      if (!this.#isInitialized) {
        return;
      }

      if (this.#fluid.baseHeight < 0) {
        this.#stopFillTimer();
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#textFrame.drawText();

        return;
      }

      this.#countToDrop = (this.#countToDrop + 1) % TypeFluid.COUNT_TO_DROP;
      if (
        !this.#countToDrop &&
        this.#fluid.baseHeight >= this.#targetWaveHeight
      ) {
        const dropWater = this.#waterDropEffect.drop();
        dropWater && this.#waterDrops.push(dropWater);
      }

      if (this.#waterDrops.length) {
        const dropWater = this.#waterDrops[0];

        if (this.#fluid.curHeight < dropWater.posY) {
          this.#fluid.setDropPosX(dropWater.x, dropWater.weight);
          this.#waterDrops.shift();
          dropWater.reset();
        }
      }

      this.#fluid.update();
      this.#waterDropEffect.update();
      this.#drawText();
      this.#waterDropEffect.draw();
    }, TypeFluid.FPS_TIME);

    this.#stopFillTimer = () => {
      clearInterval(intervalId);
      this.#textFrame.drawText();
    };
  };

  #drawText = () => {
    this.#imageData.data.fill(
      0,
      0,
      this.#fluid.maxHeight * this.#canvas.width * 4
    );

    let waveHeight;
    let pixelInfosOnPosX;
    let pixelInfo;
    let index;

    this.#pixelInfosKeys.forEach((x) => {
      waveHeight = this.#fluid.getHeightOnPosX(x);
      pixelInfosOnPosX = this.#pixelInfosList[x];

      for (let i = 0; i < pixelInfosOnPosX.length; i++) {
        if (waveHeight > pixelInfosOnPosX[i].y) {
          continue;
        }

        for (let j = i; j < pixelInfosOnPosX.length; j++) {
          pixelInfo = pixelInfosOnPosX[j];
          index = x + pixelInfo.y * this.#canvas.width;

          this.#imageData.data[index * 4] = this.#fontRGB.r;
          this.#imageData.data[index * 4 + 1] = this.#fontRGB.g;
          this.#imageData.data[index * 4 + 2] = this.#fontRGB.b;
          this.#imageData.data[index * 4 + 3] = pixelInfo.alpha;

          if (this.#fluid.maxHeight < pixelInfo.y) {
            pixelInfosOnPosX.splice(j, 1);
          }
        }

        break;
      }
    });

    this.#ctx.putImageData(this.#imageData, 0, 0);
  };

  #getClientSize = (elementObj, paddingWidth = 0, paddingHeight = 0) => {
    return {
      width: Math.round(elementObj.offsetWidth - paddingWidth),
      height: Math.round(elementObj.offsetHeight - paddingHeight),
    };
  };
}

export default TypeFluid;
