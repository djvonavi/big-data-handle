import type { ItemData, MeteoDataType } from "../types";
import { STORE_NAMES, MAIN_THREAD_CHUNK_SIZE } from "../consts";

interface CornerCoordinates {
  x: number;
  y: number;
}

const canvasWorker = new Worker("/workers/canvasWorker.js");

/**
 * function draw lines
 * @param ctx context canvas
 * @param color color of line
 * @param points coordinates [[x, y], ...]
 */
function polyline(
  ctx: CanvasRenderingContext2D,
  color: string,
  points: [number, number][]
): void {
  ctx.strokeStyle = color;
  ctx.beginPath();
  points.forEach((point, i) =>
    i ? ctx.lineTo(...point) : ctx.moveTo(...point)
  );
  ctx.stroke();
}

function drawVarticalText(
  ctx: CanvasRenderingContext2D,
  text: string,
  translateCoords: CornerCoordinates,
  textCoords: CornerCoordinates
) {
  ctx.save();
  ctx.translate(translateCoords.x, translateCoords.y);
  ctx.rotate(-Math.PI / 2); // 90 градусов в радианах
  ctx.fillText(text, textCoords.x, textCoords.y);
  ctx.restore();
}

// fallback function to draw graph when worker not avaliable
async function drawTemperatureGraphLocal(
  canvas: HTMLCanvasElement,
  temperatureData: ItemData[]
) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // определение начала и конца осей
  let originX = 30;

  // ось Y
  polyline(ctx, "black", [
    [originX, 20],
    [originX, canvas.height],
  ]);

  ctx.font = "10px Arial";
  ctx.textAlign = "right";
  const scaleChunckHeight = canvas.height / 7;

  let scaleStartY = 30;
  let centerY = 0;
  for (let i = -30; i <= 30; i += 10) {
    if (i === 0) {
      centerY = scaleStartY;
    }
    let x = originX - 5;
    ctx.fillText(String(i * -1), x, scaleStartY);
    scaleStartY += scaleChunckHeight;
  }

  //Ось X
  polyline(ctx, "black", [
    [originX, centerY],
    [canvas.width, centerY],
  ]);

  // рисуем график
  let startGraphX = originX + 10;
  ctx.beginPath();
  ctx.strokeStyle = "green";

  const graphChunkXLength =
    (canvas.width - startGraphX) / (temperatureData.length - 1);
  ctx.font = "10px Arial";
  ctx.textAlign = "left";

  /**
   * делаем рекурсивную асинхронную функцию для деблокирования основного потока
   */
  function drawTemperatureGraphAsync(startIndex = 0) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const endIndex = Math.min(startIndex + MAIN_THREAD_CHUNK_SIZE, temperatureData.length);
        for (let i = startIndex; i < endIndex; i++) {
          const temperatureItem = temperatureData[i];
          let x = startGraphX;
          let y = centerY - (temperatureItem.v / 10) * scaleChunckHeight;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          ctx.fillText(String(temperatureItem.v), x, y);
  
          drawVarticalText(
            ctx,
            temperatureItem.t,
            {
              x,
              y: canvas.height,
            },
            { x: 0, y: 0 }
          );
  
          startGraphX += graphChunkXLength;
        }
  
        if (endIndex < temperatureData.length) {
          resolve(drawTemperatureGraphAsync(endIndex));
        } else {
          ctx.stroke();
          resolve(true);
        }
      });
    });
  }
  return await drawTemperatureGraphAsync(0)
}

// fallback function to draw graph when worker not avaliable
async function drawPrecipitationGraphLocal(
  canvas: HTMLCanvasElement,
  precipitationData: ItemData[]
) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /**
   * Определение углов осей графика
   */

  const leftTopCorner: CornerCoordinates = {
    x: 30,
    y: 30,
  };

  const leftBottomCorner: CornerCoordinates = {
    x: 30,
    y: canvas.height - 50,
  };

  // ось Y
  polyline(ctx, "black", [
    [leftTopCorner.x, leftTopCorner.y],
    [leftTopCorner.x, leftBottomCorner.y],
  ]);

  ctx.font = "10px Arial";
  ctx.textAlign = "right";
  const scaleChunckHeight = leftBottomCorner.y / 21;

  /**
   * отрисовка шкалы
   */
  for (let i = 0; i < 21; i++) {
    const x = leftTopCorner.x - 5;
    const y = leftBottomCorner.y - i * scaleChunckHeight;
    ctx.fillText(String(i), x, y);
  }

  //Ось X
  polyline(ctx, "black", [
    [leftBottomCorner.x, leftBottomCorner.y],
    [canvas.width, leftBottomCorner.y],
  ]);

  // рисуем график
  let startGraphX = leftBottomCorner.x + 10;

  const graphChunkXLength =
    (canvas.width - startGraphX) / (precipitationData.length - 1);
  ctx.font = "10px Arial";
  ctx.textAlign = "left";

  /**
   * делаем рекурсивную асинхронную функцию для деблокирования основного потока
   */

  function drawPrecipitationGraphAsync(startIndex = 0) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const endIndex = Math.min(
          startIndex + MAIN_THREAD_CHUNK_SIZE,
          precipitationData.length
        );

        for (let i = startIndex; i < endIndex; i++) {
          const precipitationItem = precipitationData[i];
          const x = startGraphX + i * graphChunkXLength;
          polyline(ctx, "blue", [
            [x, leftBottomCorner.y],
            [x, leftBottomCorner.y - precipitationItem.v * scaleChunckHeight],
          ]);

          drawVarticalText(
            ctx,
            precipitationItem.t,
            {
              x,
              y: canvas.height,
            },
            { x: 0, y: 0 }
          );
        }

        if (endIndex < precipitationData.length) {
          resolve(drawPrecipitationGraphAsync(endIndex));
        } else {
          ctx.stroke();
          resolve(true);
        }
      });
    });
  }

  return await drawPrecipitationGraphAsync(0);
}

function drawGraph(
  graphType: MeteoDataType,
  canvas: HTMLCanvasElement,
  precipitationData: ItemData[]
): Promise<void> {
  const localDrawFunction =
    graphType === STORE_NAMES.TEMPERATURE
      ? drawTemperatureGraphLocal
      : drawPrecipitationGraphLocal;
  return new Promise((resolve) => {
    if (!!canvas.transferControlToOffscreen) {
      // if transferControl avaliable pass draw to webworker
      // stringify - to pass oversized data
      canvasWorker.onmessage = (event) => {
        if (event.data.status === "done") {
          resolve();
        }
      };
      try {
        const offscreen = canvas.transferControlToOffscreen();
        canvasWorker.postMessage(
          {
            graphType,
            canvas: offscreen,
            data: JSON.stringify(precipitationData),
          },
          [offscreen]
        );
      } catch (e) {
        canvasWorker.postMessage({
          graphType,
          data: JSON.stringify(precipitationData),
        });
      }
    } else {
      // else draw in main thread
      localDrawFunction(canvas, precipitationData).then(() => {
        resolve();
      });
    }
  });
}

export async function drawTemperatureGraph(
  canvas: HTMLCanvasElement,
  precipitationData: ItemData[]
): Promise<void> {
  return await drawGraph(STORE_NAMES.TEMPERATURE, canvas, precipitationData);
}

export async function drawPrecipitationGraph(
  canvas: HTMLCanvasElement,
  precipitationData: ItemData[]
): Promise<void> {
  return await drawGraph(STORE_NAMES.PRECIPITATION, canvas, precipitationData);
}
