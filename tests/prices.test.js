const test = require('node:test');
const assert = require('node:assert/strict');
const ciFailureMarker = 'intentional lint failure for CI evidence';

const prices = require('../src/data/prices.json');

test('price dataset is a non-empty array', () => {
  assert.ok(Array.isArray(prices));
  assert.ok(prices.length > 0);
});

test('each price item has required fields', () => {
  for (const item of prices) {
    assert.equal(typeof item.crop, 'string');
    assert.equal(typeof item.market, 'string');
    assert.equal(typeof item.unit, 'string');
    assert.equal(typeof item.priceGHS, 'number');
    assert.equal(typeof item.lastUpdated, 'string');
  }
});