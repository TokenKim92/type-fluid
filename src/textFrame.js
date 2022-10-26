class TextFrame {
  #ctx;
  #rootStyle;
  #text;
  #alphaValue;
  #baseLinePos;

  constructor(ctx, rootStyle, text, alphaValue) {
    this.#ctx = ctx;
    this.#rootStyle = rootStyle;
    this.#text = text;
    this.#alphaValue = alphaValue;
    this.bottomPos = 0;
  }

  getPixelPositions = (stageRect) => {
    this.#baseLinePos = [];
    this.#ctx.save();

    this.#ctx.font = `${this.#rootStyle.fontWeight} ${this.#rootStyle.fontSize} ${this.#rootStyle.fontFamily}`; //prettier-ignore
    this.#ctx.fillStyle = `rgba(255, 255, 255, ${this.#alphaValue})`;
    this.#ctx.textBaseline = 'middle';

    const textFields = [];
    if (this.#calculateLineCount(stageRect) === 1) {
      const baseLinePos = this.#drawTextFrame(stageRect, this.#text);
      this.#baseLinePos.push(baseLinePos);
      this.#getTextFields(this.#text).forEach((textField) =>
        textFields.push(textField)
      );
    } else {
      const textList = this.#getTextList(stageRect);
      let baseLinePos;
      textList.forEach((lineText, index) => {
        baseLinePos = this.#drawTextFrame(stageRect, lineText, index);
        this.#baseLinePos.push(baseLinePos);
        this.#getTextFields(lineText, index).forEach((textField) =>
          textFields.push(textField)
        );
      });
    }

    const pixelPositions = this.#createPixelPositions(stageRect, textFields);
    this.#ctx.clearRect(0, 0, stageRect.width, stageRect.height);
    this.#ctx.restore();

    return pixelPositions;
  };

  drawText = (stageRect) => {
    this.#ctx.save();

    this.#ctx.font = `${this.#rootStyle.fontWeight} ${this.#rootStyle.fontSize} ${this.#rootStyle.fontFamily}`; //prettier-ignore
    this.#ctx.fillStyle = this.#rootStyle.color;
    this.#ctx.textBaseline = 'middle';

    if (this.#calculateLineCount(stageRect) === 1) {
      this.#drawTextFrame(stageRect, this.#text);
    } else {
      const textList = this.#getTextList(stageRect);
      textList.forEach((lineText, index) =>
        this.#drawTextFrame(stageRect, lineText, index)
      );
    }

    this.#ctx.restore();
  };

  #getTextList = (stageRect) => {
    const newTextList = [];

    this.#text.split('\n').forEach((lineText) => {
      const textList = lineText.split(' ');
      let prevText = '';
      let isOutOfStage = false;
      let isLastText = false;

      textList.forEach((text, index) => {
        isOutOfStage =
          this.#ctx.measureText(prevText + text).width > stageRect.width;
        isLastText = index === textList.length - 1;

        if (isOutOfStage) {
          newTextList.push(prevText.trimEnd());
          isLastText ? newTextList.push(text) : (prevText = text + ' ');
        } else {
          isLastText
            ? newTextList.push(prevText + text)
            : (prevText = prevText + text + ' ');
        }
      });
    });

    return newTextList;
  };

  #drawTextFrame = (stageRect, text, index = 0) => {
    const totalTextMetrics = this.#ctx.measureText(text);
    const baseLinePos = this.#calculateBaseLinePos(
      stageRect,
      totalTextMetrics,
      index
    );

    this.#ctx.fillText(text, baseLinePos.x, baseLinePos.y);

    return baseLinePos;
  };

  #getTextFields = (text, index = 0) => {
    const textFields = [];
    const textWidthList = [];
    const baseLinePos = this.#baseLinePos[index];
    let character;
    let prevCharacter = '';
    let textMetrics;
    let textField;
    let actualTextWidth;
    let offsetPosX;

    for (let i = 0; i < text.length; i++) {
      character = text[i];
      textMetrics = this.#ctx.measureText(character);

      if (character === ' ') {
        textWidthList.push(textMetrics.width);
        continue;
      }

      actualTextWidth =
        this.#ctx.measureText(prevCharacter + character).width -
        this.#ctx.measureText(prevCharacter).width;
      offsetPosX =
        actualTextWidth !== textMetrics.width
          ? textMetrics.width - actualTextWidth
          : 0;

      textField = {
        x:
          i === 0
            ? Math.round(baseLinePos.x - textMetrics.actualBoundingBoxLeft)
            : Math.round(
                textWidthList.reduce(
                  (sum, textWidth) => sum + textWidth,
                  baseLinePos.x
                ) -
                  textMetrics.actualBoundingBoxLeft -
                  offsetPosX
              ),
        y: Math.round(baseLinePos.y - textMetrics.actualBoundingBoxAscent - 1),
        width: Math.round(
          textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight
        ),
        height: Math.round(
          textMetrics.actualBoundingBoxAscent +
            textMetrics.actualBoundingBoxDescent +
            2
        ),
      };

      textWidthList.push(actualTextWidth);
      textFields.push(textField);
      prevCharacter = character;
    }

    const lastTextField = textFields[textFields.length - 1];
    this.bottomPos = lastTextField.y + lastTextField.height;

    return textFields;
  };

  #createPixelPositions = (stageRect, textFields) => {
    const pixelPositions = [];
    const imageData = this.#ctx.getImageData(
      0, 0, stageRect.width, stageRect.height
    ); // prettier-ignore

    let alpha = 0;
    textFields.forEach((textField) => {
      for (let y = textField.y; y < textField.y + textField.height; y++) {
        for (let x = textField.x; x < textField.x + textField.width; x++) {
          alpha = imageData.data[(x + y * stageRect.width) * 4 + 3];
          alpha && pixelPositions.push({ x, y, alpha });
        }
      }
    });

    return pixelPositions;
  };

  #calculateBaseLinePos = (stageRect, textMetrics, index) => {
    const calculateBaseLinePosX = () => {
      switch (this.#rootStyle.textAlign) {
        case 'end':
          return Math.round(stageRect.width - textMetrics.width);
        case 'center':
          return Math.round((stageRect.width - textMetrics.width) / 2);
        case 'justify':
          console.warn("'justify' option doesn't work.");
        case 'start':
        default:
          return 0;
      }
    };

    // TODO: find more case
    const calculateBaseLinePosY = (index) => {
      const lineHeight = this.#calculateLineHeight(stageRect);
      const baseLinePosY =
        (lineHeight +
          textMetrics.actualBoundingBoxAscent -
          textMetrics.actualBoundingBoxDescent) /
        2;
      return Math.round(baseLinePosY + lineHeight * index);
    };

    return {
      x: calculateBaseLinePosX(),
      y: calculateBaseLinePosY(index),
    };
  };

  #calculateLineHeight = (stageRect) => {
    if (this.#rootStyle.lineHeight !== 'normal') {
      return parseInt(this.#rootStyle.lineHeight);
    }

    //TODO: This is an estimate and may not be accurate!
    const height = parseInt(this.#rootStyle.fontSize) * 1.2;
    const lineCount = Math.round(stageRect.height / height);

    return stageRect.height / lineCount;
  };

  #calculateLineCount = (stageRect) => {
    return Math.round(stageRect.height / this.#calculateLineHeight(stageRect));
  };
}

export default TextFrame;
