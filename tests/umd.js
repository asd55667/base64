const test = require('ava')
const Base64 = require('..');

test('umd module', () => {

    if(typeof global !== "undefined") {
        test('should not modify `global` variables', t => {
            t.deepEqual("Base64" in global, false);
        });
    } else if(typeof window !== "undefined") {
        test('should inject `window` namespace', t => {
            t.deepEqual("Base64" in window, true);
            t.deepEqual(typeof window.Base64, 'object');
            t.deepEqual("noConflict" in window.Base64, true);
        });
    }
    test('should work with namespace and non-namespace usage both', t => {
        t.deepEqual(!Base64.Base64, false);
        t.notDeepEqual(Base64.Base64, Base64);
        t.deepEqual(Base64.encode, Base64.Base64.encode);
    });
})
