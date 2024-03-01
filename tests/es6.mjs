import { extendString } from '../base64.mjs'
import test from 'ava'

delete String.prototype.fromBase64;
delete String.prototype.toBase64;
delete String.prototype.toBase64URI;
delete String.prototype.toBase64URL;
delete String.prototype.toUint8Array;
extendString();

test('ES6 String', t=> {
    t.deepEqual('小飼弾'.toBase64(), '5bCP6aO85by+')
    t.deepEqual('小飼弾'.toBase64(true), '5bCP6aO85by-')
    t.deepEqual('小飼弾'.toBase64URI(), '5bCP6aO85by-')
    t.deepEqual('5bCP6aO85by+'.fromBase64(), '小飼弾')
    t.deepEqual('5bCP6aO85by-'.fromBase64(), '小飼弾')
})