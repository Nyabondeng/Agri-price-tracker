const http = require('http');
const prices = require('./data/prices.json');

const host = '0.0.0.0';
const port = Number(process.env.PORT || 3000);

function buildHtml(items) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.crop}</td>
          <td>${item.market}</td>
          <td>${item.unit}</td>
          <td>GHS ${item.priceGHS}</td>
          <td>${item.lastUpdated}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agri Price Tracker Ghana</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
      h1 { margin-bottom: 6px; }
      p { margin-top: 0; color: #4b5563; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
      th { background: #f3f4f6; }
      code { background: #f3f4f6; padding: 2px 6px; }
    </style>
  </head>
  <body>
    <h1>Agri Price Tracker Ghana</h1>
    <p>Latest indicative prices for key crops in selected Ghana markets.</p>
    <p>JSON endpoint: <code>/api/prices</code></p>
    <table>
      <thead>
        <tr>
          <th>Crop</th>
          <th>Market</th>
          <th>Unit</th>
          <th>Price</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

const server = http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/api/prices') {
    const payload = {
      country: 'Ghana',
      generatedAt: new Date().toISOString(),
      items: prices
    };

    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload, null, 2));
    return;
  }

  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(buildHtml(prices));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ message: 'Route not found' }));
});

server.listen(port, host, () => {
  console.log(`Agri Price Tracker Ghana running on http://localhost:${port}`);
});
