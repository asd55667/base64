const test = require('ava')
const Base64 = require('../..');

test('basic', t => {
    t.deepEqual(Base64.encode('d'), 'ZA==')
    t.deepEqual(Base64.encode('da'), 'ZGE=')
    t.deepEqual(Base64.encode('dan'), 'ZGFu')
    t.deepEqual(Base64.decode('ZA=='), 'd')
    t.deepEqual(Base64.decode('ZGE='), 'da')
    t.deepEqual(Base64.decode('ZGFu'), 'dan')
})

test('whitespace', t => {
    t.deepEqual(Base64.decode('ZA =='), 'd')
    t.deepEqual(Base64.decode('ZG E='), 'da')
    t.deepEqual(Base64.decode('ZGF u'), 'dan')
})

test('null', t => {
    t.deepEqual(Base64.encode('\0'), 'AA==')
    t.deepEqual(Base64.encode('\0\0'), 'AAA=')
    t.deepEqual(Base64.encode('\0\0\0'), 'AAAA')
    t.deepEqual(Base64.decode('AA=='), '\0')
    t.deepEqual(Base64.decode('AAA='), '\0\0')
    t.deepEqual(Base64.decode('AAAA'), '\0\0\0')
})

test('Base64', t => {
    t.deepEqual(Base64.encode('小飼弾'), '5bCP6aO85by+')
    t.deepEqual(Base64.encodeURI('小飼弾'), '5bCP6aO85by-')
    t.deepEqual(Base64.decode('5bCP6aO85by+'), '小飼弾')
    t.deepEqual(Base64.decode('5bCP6aO85by-'), '小飼弾')
})

test('isValid', t => {
    t.deepEqual(Base64.isValid(''), true)
    t.deepEqual(Base64.isValid(0), false)
    t.deepEqual(Base64.isValid('Z'), true)
    t.deepEqual(Base64.isValid('ZA'), true)
    t.deepEqual(Base64.isValid('ZA='), true)
    t.deepEqual(Base64.isValid('ZA=='), true)
    t.deepEqual(Base64.isValid('++'), true)
    t.deepEqual(Base64.isValid('+-'), false)
    t.deepEqual(Base64.isValid('--'), true)
    t.deepEqual(Base64.isValid('//'), true)
    t.deepEqual(Base64.isValid('__'), true)
    t.deepEqual(Base64.isValid('/_'), false)
})


if (typeof Uint8Array === 'function') {
    test('fromUint8Array', t => {
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100, 97, 110, 107, 111, 103, 97, 105])), Base64.encode('dankogai'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100, 97, 110, 107, 111, 103, 97])), Base64.encode('dankoga'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100, 97, 110, 107, 111, 103])), Base64.encode('dankog'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100, 97, 110, 107, 111])), Base64.encode('danko'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100, 97, 110, 107])), Base64.encode('dank'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100, 97, 110])), Base64.encode('dan'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100, 97])), Base64.encode('da'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([100])), Base64.encode('d'))
        t.deepEqual(Base64.fromUint8Array(new Uint8Array([])), Base64.encode(''))
    })

    test('toUint8Array', t => {
        var _2str = function (a) {
            return Array.prototype.slice.call(a, 0).toString();
        }
        t.deepEqual(_2str(Base64.toUint8Array('ZGFua29nYWk=')), '100,97,110,107,111,103,97,105')
        t.deepEqual(_2str(Base64.toUint8Array('ZGFua29nYQ==')), '100,97,110,107,111,103,97')
        t.deepEqual(_2str(Base64.toUint8Array('ZGFua29n')), '100,97,110,107,111,103')
        t.deepEqual(_2str(Base64.toUint8Array('ZGFua28=')), '100,97,110,107,111')
        t.deepEqual(_2str(Base64.toUint8Array('ZGFuaw==')), '100,97,110,107')
        t.deepEqual(_2str(Base64.toUint8Array('ZGFu')), '100,97,110')
        t.deepEqual(_2str(Base64.toUint8Array('ZGE=')), '100,97')
        t.deepEqual(_2str(Base64.toUint8Array('ZA==')), '100')
        t.deepEqual(_2str(Base64.toUint8Array('')), '')

    })
}