const test = require('ava')
const { toBase64, toBase64URI, fromBase64 } = require('..');

test('ES String', t => {
    t.deepEqual(toBase64('小飼弾'), '5bCP6aO85by+')
    t.deepEqual(toBase64('小飼弾', true), '5bCP6aO85by-')
    t.deepEqual(toBase64URI('小飼弾'), '5bCP6aO85by-')
    // t.deepEqual(fromBase64('5bCP6aO85by+'), '小飼弾')
    // t.deepEqual(fromBase64('5bCP6aO85by-'), '小飼弾')
})
