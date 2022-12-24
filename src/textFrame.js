class TextFrame {
  #ctx;
  #rootStyle;
  #text;
  #alphaValue;
  #lineTextAttributes = [];

  constructor(ctx, rootStyle, text, alphaValue) {
    this.#ctx = ctx;
    this.#rootStyle = rootStyle;
    this.#text = text;
    this.#alphaValue = alphaValue;
  }

  getRect = (stageSize) => {
    const oneLineHandler = (stageSize) => {
      const textFields = this.#getTextFields(
        this.#text,
        this.#drawTextFrame(stageSize, this.#text)
      );
      const lastTextField = textFields[textFields.length - 1];
      let top = stageSize.height;
      textFields.forEach(
        (textField) => top > textField.y && (top = textField.y)
      );

      return {
        left: textFields[0].x,
        top,
        right: lastTextField.x + lastTextField.width,
      };
    };

    const multiLineHandler = (stageSize) => {
      const textList = this.#getTextList(stageSize);
      let textFields;
      let lastTextField, lastTextFieldRight;
      let left = stageSize.width;
      let right = 0;
      let top = stageSize.height;

      textList.forEach((lineText, index) => {
        textFields = this.#getTextFields(
          lineText,
          this.#drawTextFrame(stageSize, lineText, index)
        );
        lastTextField = textFields[textFields.length - 1];
        lastTextFieldRight = lastTextField.x + lastTextField.width;

        left > textFields[0].x && (left = textFields[0].x);
        right < lastTextFieldRight && (right = lastTextFieldRight);

        if (index === 0) {
          textFields.forEach(
            (textField) => top > textField.y && (top = textField.y)
          );
        }
      });

      return {
        left,
        top,
        right,
      };
    };

    this.#ctx.save();
    this.#initContext();

    const rect =
      this.#calculateLineCount(stageSize) === 1
        ? oneLineHandler(stageSize)
        : multiLineHandler(stageSize);

    this.#ctx.clearRect(0, 0, stageSize.width, stageSize.height);
    this.#ctx.restore();

    this.rect = {
      x: rect.left,
      y: rect.top,
      width: rect.right - rect.left,
      height: stageSize.height,
    };
    return this.rect;
  };

  getPixelInfosList = (stageSize) => {
    const oneLineHandler = (stageSize) => {
      const baseLine = this.#drawTextFrame(stageSize, this.#text);
      this.#lineTextAttributes.push({
        baseLine,
        lineText: this.#text,
      });

      return this.#getTextFields(this.#text, baseLine);
    };

    const multiLineHandler = (stageSize) => {
      const textFields = [];
      const textList = this.#getTextList(stageSize);
      let baseLine;

      textList.forEach((lineText, index) => {
        baseLine = this.#drawTextFrame(stageSize, lineText, index);
        this.#lineTextAttributes.push({
          baseLine,
          lineText,
        });

        this.#getTextFields(lineText, baseLine).forEach((textField) =>
          textFields.push(textField)
        );
      });

      return textFields;
    };

    this.#ctx.save();
    this.#initContext();
    this.#lineTextAttributes = [];

    const textFields =
      this.#calculateLineCount(stageSize) === 1
        ? oneLineHandler(stageSize)
        : multiLineHandler(stageSize);
    const pixelInfosList = this.#initPixelInfosList(stageSize, textFields);

    this.#ctx.clearRect(0, 0, stageSize.width, stageSize.height);
    this.#ctx.restore();

    return pixelInfosList;
  };

  drawText = () => {
    this.#ctx.save();
    this.#initContext(this.#rootStyle.color);

    this.#lineTextAttributes.forEach((lineTextAttribute) => {
      this.#ctx.fillText(
        lineTextAttribute.lineText,
        lineTextAttribute.baseLine.x,
        lineTextAttribute.baseLine.y
      );
    });

    this.#ctx.restore();
  };

  #initContext = (fillStyle = undefined) => {
    fillStyle ?? (fillStyle = `rgba(255, 255, 255, ${this.#alphaValue})`);

    this.#ctx.font = `${this.#rootStyle.fontWeight} ${this.#rootStyle.fontSize} ${this.#rootStyle.fontFamily}`; //prettier-ignore
    this.#ctx.fillStyle = fillStyle;
    this.#ctx.textBaseline = 'middle';
  };

  #getTextList = (stageSize) => {
    const newTextList = [];

    this.#text.split('\n').forEach((lineText) => {
      const textList = lineText.split(' ');
      let prevText = '';
      let isOutOfStage = false;
      let isLastText = false;

      textList.forEach((text, index) => {
        isOutOfStage =
          this.#ctx.measureText(prevText + text).width > stageSize.width;
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

    while (newTextList.includes('')) {
      const index = newTextList.indexOf('');
      newTextList.splice(index, 1);
    }

    return newTextList;
  };

  #drawTextFrame = (stageSize, text, index = 0) => {
    const totalTextMetrics = this.#ctx.measureText(text);
    const baseLinePos = this.#calculateBaseLinePos(
      stageSize,
      totalTextMetrics,
      index
    );

    this.#ctx.fillText(text, baseLinePos.x, baseLinePos.y);

    return baseLinePos;
  };

  #getTextFields = (text, baseLinePos) => {
    const textFields = [];
    const textWidthList = [];
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

    return textFields;
  };

  #initPixelInfosList = (stageSize, textFields) => {
    const posList = [];
    const alphaList = [];
    const imageData = this.#ctx.getImageData(
      0, 0, stageSize.width, stageSize.height
    ); // prettier-ignore

    let alpha = 0;
    textFields.forEach((textField) => {
      for (let y = textField.y; y < textField.y + textField.height; y++) {
        for (let x = textField.x; x < textField.x + textField.width; x++) {
          alpha = imageData.data[(x + y * stageSize.width) * 4 + 3];
          if (alpha) {
            if (!posList[x]) {
              posList[x] = new Array();
              alphaList[x] = new Array();
            }

            if (!posList[x].includes(y)) {
              posList[x].push(y);
              alphaList[x].push(alpha);
            }
          }
        }
      }
    });

    return { posList, alphaList };
  };

  #calculateBaseLinePos = (stageSize, textMetrics, index) => {
    const calculateBaseLinePosX = () => {
      switch (this.#rootStyle.textAlign) {
        case 'end':
          return Math.round(
            stageSize.width - textMetrics.actualBoundingBoxRight
          );
        case 'center':
          return Math.round((stageSize.width - textMetrics.width) / 2);
        case 'justify':
          console.warn("'justify' option doesn't work.");
        case 'start':
        default:
          return Math.round(textMetrics.actualBoundingBoxLeft);
      }
    };

    // TODO: find more case
    const calculateBaseLinePosY = (index) => {
      const lineHeight = this.#calculateLineHeight(stageSize);
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

  #calculateLineHeight = (stageSize) => {
    if (this.#rootStyle.lineHeight !== 'normal') {
      return parseInt(this.#rootStyle.lineHeight);
    }

    //TODO: This is an estimate and may not be accurate!
    const heightOffset = 1.2;
    const height = parseInt(this.#rootStyle.fontSize) * heightOffset;
    const lineCount = Math.round(stageSize.height / height);

    return stageSize.height / lineCount;
  };

  #calculateLineCount = (stageRect) => {
    return Math.round(stageRect.height / this.#calculateLineHeight(stageRect));
  };
}

export default TextFrame;
