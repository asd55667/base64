function atob(str) {
    str = String(str)
    if (!str) return ''

    let output = ''
    const stack = []
    for (const ch of str) {
        if (ch === ' ') continue
        stack.push(ch)
        if (stack.length === 4) {
            output += consume(stack)
            stack.length = 0
        }
    }

    return output

    function consume(arr) {
        const c1 = _decode(arr[0])
        const c2 = _decode(arr[1])
        /**
         * 0b 00(xxxxxx00 |
         * 0b        00xx)|0000
        */
        const d1 = ((0x3f & c1) << 2) | (c2 >> 4)
        if (arr[2] === '=' && arr[3] === '=') return String.fromCharCode(d1)

        const c3 = _decode(arr[2])
        /**
         * 0b 00(xxxxxx00 |          |
         * 0b        00xx)|(xxxx0000 |
         * 0b             |   00xxxx)|xx
        */
        const d2 = ((0x0f & c2) << 4) | (c3 >> 2)
        if (arr[3] === '=') return [d1, d2].map(v => String.fromCharCode(v)).join('')

        const c4 = _decode(arr[3])
        /**
         * 0b 00(xxxxxx00 |          |
         * 0b        00xx)|(xxxx0000 |
         * 0b             |   00xxxx)|(xx000000
         * 0b             |          | 00xxxxxx)  
        */
        const d3 = ((0x03 & c3) << 6) | c4

        // not ascii
        if ([d1, d2, d3].some(v => 0x80 & v)) {
            if (isUnicode([d1, d2, d3])) {
                console.log(d1, d2, d3)
            }
        }

        return [d1, d2, d3].map(v => String.fromCharCode(v)).join('')
    }
}

// mask for input
const m1 = 0x03
const m2 = 0x0f
const m3 = 0x3f

function btoa(str, urlSafe = false) {
    str = String(str)
    if (!str.length) return ''

    let output = ''
    let i = 1
    const stack = []
    while (i <= str.length) {
        if (stack.length === 3) consume()

        const ch = str[i - 1]
        const charCode = ch.charCodeAt()

        // 3-byte unicode
        if (charCode >= 0x0800 && charCode <= 0xffff) {
            consume()
            const b1 = 0xe0 | charCode >> 12 & 0xf;
            const b2 = 0x80 | charCode >> 6 & 0x3f;
            const b3 = 0x80 | charCode & 0x3f;
            stack.push(b1, b2, b3)
        } else stack.push(charCode)
        i += 1
    }
    consume()
    return output

    function consume() {
        output += btoaAscii(stack, urlSafe)
        stack.length = 0
    }
}

function btoaAscii(str, urlSafe) {
    if (!str?.length) return ''
    console.assert(str.length <= 3, `length of ${str} should smaller than 4`)
    /**
     * 0b (xxxxxx)| 
     *            |(xx0000)
     */
    const v1 = str[0]
    const ch1 = _encode(v1 >> 2, urlSafe)
    if (str.length === 1) {
        const ch2 = _encode((m1 & v1) << 4, urlSafe)
        return [ch1, ch2, '=='].join('')
    }

    /**
     * 0b (xxxxxx)   |
     *            (xx|xxxx)
     *               |     (xxxx00)
     */
    const v2 = str[1]
    const ch2 = _encode(((m1 & v1) << 4) | (v2 >> 4), urlSafe)
    if (str.length === 2) {
        const ch3 = _encode((m2 & v2) << 2, urlSafe)
        return [ch1, ch2, ch3, '='].join('')
    }

    /**
     * 0b (xxxxxx)   |           |
     *            (xx|xxxx)      |
     *               |      (xxxx|xx)
     *               |           |   (xxxxxx)
     */
    const v3 = str[2]
    const ch3 = _encode(((m2 & v2) << 2) | (v3 >> 6), urlSafe)
    const ch4 = _encode(m3 & v3, urlSafe)
    return [ch1, ch2, ch3, ch4].join('')
}

function _encode(n, urlSafe) {
    console.assert(n >= 0 && n < 64, `${n} should be in range 0-63`);
    if (n >= 0 && n < 26) {
        return String.fromCharCode(n + 'A'.charCodeAt())
    } else if (n >= 26 && n < 52) {
        return String.fromCharCode(n - 26 + 'a'.charCodeAt())
    } else if (n >= 52 && n <= 61) {
        return String.fromCharCode(n - 52 + '0'.charCodeAt())
    }
    if (n === 62) return urlSafe ? '-' : '+'
    if (n === 63) return urlSafe ? '_' : '/'
}

function _decode(ch) {
    const code = ch.charCodeAt()
    if (code >= 'A'.charCodeAt() && code <= 'Z'.charCodeAt()) {
        return code - 'A'.charCodeAt()
    }

    if (code >= 'a'.charCodeAt() && code <= 'z'.charCodeAt()) {
        return code - 'a'.charCodeAt() + 26
    }

    if (code >= '0'.charCodeAt() && code <= '9'.charCodeAt()) {
        return code - '0'.charCodeAt() + 52
    }

    if (ch === '+' || ch === '-') return 62
    if (ch === '/' || ch === '_') return 63

    console.assert(0, `invalid character ${ch}.`)
}

function toUint8Array() {
    // 
}

function fromUint8Array() {
    // 
}

function encodeURI(str) {
    return btoa(str, true)
}

function isValid() {
    // 
}

function isUnicode(arr) {
    const [d1, d2, d3, d4] = arr
    if (arr.length === 1) return d1 < 2 ** 8
    if (arr.length === 2) return d1 & 0xe0 && d2 & 0x80
    if (arr.length === 3) return d1 & 0xe0 && d2 & 0x80 && d3 & 0x80
    if (arr.length === 4) return d1 & 0xf0 && d2 & 0x80 && d3 & 0x80 && d4 & 0x80
    return false
}

module.exports = {
    atob,
    btoa,
    encode: btoa,
    decode: atob,
    toBase64: btoa,
    fromBase64: atob,
    toUint8Array,
    fromUint8Array,
    encodeURI,
    toBase64URI: encodeURI,
    isValid,
    extendString: () => { }
}