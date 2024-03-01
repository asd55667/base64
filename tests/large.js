const test = require('ava')
const Base64 = require('..');

var seed = function () {
    var a, i;
    for (a = [], i = 0; i < 256; i++) {
        a.push(String.fromCharCode(i));
    }
    return a.join('');
}();

test('Large Base64', t => {
    for (var i = 0, str = seed; i < 16; str += str, i++) {
        t.deepEqual(Base64.decode(Base64.encode(str)), str)
    }
})