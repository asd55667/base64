const test = require('ava')
const b64 = require('../..')

test('decode url-safe style base64 strings', function (t) {
  const expected = [0xff, 0xff, 0xbe, 0xff, 0xef, 0xbf, 0xfb, 0xef, 0xff]

  let str = '//++/++/++//'
  let actual = b64.toByteArray(str)
  for (let i = 0; i < actual.length; i++) {
    t.deepEqual(actual[i], expected[i])
  }

  t.deepEqual(b64.byteLength(str), actual.length)

  str = '__--_--_--__'
  actual = b64.toByteArray(str)
  for (let i = 0; i < actual.length; i++) {
    t.deepEqual(actual[i], expected[i])
  }

  t.deepEqual(b64.byteLength(str), actual.length)
})
