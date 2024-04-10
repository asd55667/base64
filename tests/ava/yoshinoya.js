const test = require('ava')
const Base64 = require('../..');

test('Yoshinoya', t => {
    t.deepEqual(Base64.encode('𠮷野家'), '8KCut+mHjuWutg==')
    t.deepEqual(Base64.encodeURI('𠮷野家'), '8KCut-mHjuWutg')
    t.deepEqual(Base64.decode('8KCut+mHjuWutg=='), '𠮷野家')
    t.deepEqual(Base64.decode('8KCut-mHjuWutg'), '𠮷野家')
    t.deepEqual(Base64.decode('7aGC7b636YeO5a62'), '𠮷野家')
})
