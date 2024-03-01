const test = require('ava')
const Base64 = require('..');

test('basic', t => {
    t.deepEqual(Base64.btoa('d'), 'ZA==')
    t.deepEqual(Base64.btoa('da'), 'ZGE=')
    t.deepEqual(Base64.btoa('dan'), 'ZGFu')
    t.deepEqual(Base64.atob('ZA=='), 'd')
    t.deepEqual(Base64.atob('ZGE='), 'da')
    t.deepEqual(Base64.atob('ZGFu'), 'dan')
})

test('whitespace', t => {
    t.deepEqual(Base64.atob('ZA =='), 'd')
    t.deepEqual(Base64.atob('ZG E='), 'da')
    t.deepEqual(Base64.atob('ZGF u'), 'dan')
})

test('null', t => {
    t.deepEqual(Base64.btoa('\0'), 'AA==')
    t.deepEqual(Base64.btoa('\0\0'), 'AAA=')
    t.deepEqual(Base64.btoa('\0\0\0'), 'AAAA')
    t.deepEqual(Base64.atob('AA=='), '\0')
    t.deepEqual(Base64.atob('AAA='), '\0\0')
    t.deepEqual(Base64.atob('AAAA'), '\0\0\0')
})

test('binary', t => {

    var pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    var pngBinary = '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x04\x00\x00\x00\xb5\x1c\x0c\x02\x00\x00\x00\x0b\x49\x44\x41\x54\x78\xda\x63\x64\x60\x00\x00\x00\x06\x00\x02\x30\x81\xd0\x2f\x00\x00\x00\x00\x49\x45\x4e\x44\xae\x42\x60\x82';
    t.deepEqual(Base64.btoa(pngBinary), pngBase64)
    t.deepEqual(Base64.atob(pngBase64), pngBinary)
})
