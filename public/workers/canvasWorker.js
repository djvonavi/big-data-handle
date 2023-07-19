function polyline(ctx, color, points) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  points.forEach((point, i) =>
    i ? ctx.lineTo(...point) : ctx.moveTo(...point)
  );
  ctx.stroke();
}
function drawVarticalText(ctx, text, translateCoords, textCoords) {
  ctx.save();
  ctx.translate(translateCoords.x, translateCoords.y);
  ctx.rotate(-Math.PI / 2); // 90 градусов в радианах
  ctx.fillText(text, textCoords.x, textCoords.y);
  ctx.restore();
}

function drawTemperatureGraph(canvas, temperatureData) {
  const ctx = canvas.getContext("2d");
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
  let currentYear = "";
  for (let i = 0; i < temperatureData.length; i++) {
    const temperatureItem = temperatureData[i];
    let x = startGraphX;
    let y = centerY - (temperatureItem.v / 10) * scaleChunckHeight;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    ctx.fillText(String(temperatureItem.v), x, y);
    const year = temperatureItem.t.slice(0, 4);
    if (currentYear !== year) {
      drawVarticalText(
        ctx,
        year,
        {
          x,
          y: canvas.height,
        },
        { x: 0, y: 0 }
      );
      currentYear = year
    }
    startGraphX += graphChunkXLength;
  }
  ctx.stroke();
}

function drawPrecipitationGraph(canvas, precipitationData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const leftTopCorner = {
    x: 30,
    y: 30,
  };

  const leftBottomCorner = {
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
  const scaleChunckHeight = leftBottomCorner.y / 11;

  for (let i = 0; i < 11; i++) {
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
  let currentYear = ''
  for (let i = 0; i < precipitationData.length; i++) {
    const precipitationItem = precipitationData[i];
    const x = startGraphX + i * graphChunkXLength;
    polyline(ctx, "blue", [
      [x, leftBottomCorner.y],
      [x, leftBottomCorner.y - precipitationItem.v * scaleChunckHeight],
    ]);

    const year = precipitationItem.t.slice(0, 4);
    if (currentYear !== year) {
      drawVarticalText(
        ctx,
        String(precipitationItem.t),
        {
          x,
          y: canvas.height,
        },
        { x: 0, y: 0 }
      );
      currentYear = year
    }
  }
  ctx.stroke();
}

self.onmessage = function (evt) {
  try {
    const { canvas, data, graphType } = evt.data;
    const parsedData = JSON.parse(data);
    if (graphType === "temperature") {
      drawTemperatureGraph(canvas, parsedData);
    } else {
      drawPrecipitationGraph(canvas, parsedData);
    }
    self.postMessage({ status: "done" });
  } catch (e) {
    console.error("error in canvas worker", e);
  }
};
