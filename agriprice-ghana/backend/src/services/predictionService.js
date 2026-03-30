export function predictNextValue(series) {
  if (!Array.isArray(series) || series.length < 2) {
    return null;
  }

  const points = series.map((entry, index) => ({
    x: index + 1,
    y: Number(entry.price)
  }));

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumX2 = points.reduce((acc, p) => acc + p.x * p.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return null;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const nextX = n + 1;
  const prediction = slope * nextX + intercept;

  return Math.max(0, Number(prediction.toFixed(2)));
}
