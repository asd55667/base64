function atob(str) {
    str = String(str)
    if (!str) return ''

    return _atob(str.split('').filter(ch => ch !== ' '))
}

function toUint8Array(arr) {
    let i = 0
    const output = []

    while (i < arr.length) {
        const c1 = _decode(arr[i])

        console.assert(arr[i + 1], `should be empty`)
        const c2 = _decode(arr[i + 1])
        /**
         * 0b 00(xxxxxx00 |
         * 0b        00xx)|0000
        */
        const d1 = ((0x3f & c1) << 2) | (c2 >> 4)

        if (arr[i + 2] === '=' && arr[i + 3] === '=' || i + 2 === arr.length) {
            output.push(d1)
            i += (i + 2 === arr.length ? 2 : 4)
            continue
        }

        const c3 = _decode(arr[i + 2])
        /**
         * 0b 00(xxxxxx00 |          |
         * 0b        00xx)|(xxxx0000 |
         * 0b             |   00xxxx)|xx
        */
        const d2 = ((0x0f & c2) << 4) | (c3 >> 2)

        if (arr[i + 3] === '=' || i + 3 === arr.length) {
            output.push(d1, d2)
            i += (i + 3 === arr.length ? 3 : 4)
            continue
        }

        const c4 = _decode(arr[i + 3])

        /**
         * 0b 00(xxxxxx00 |          |
         * 0b        00xx)|(xxxx0000 |
         * 0b             |   00xxxx)|(xx000000
         * 0b             |          | 00xxxxxx)  
        */
        const d3 = ((0x03 & c3) << 6) | c4
        output.push(d1, d2, d3)
        i += 4
    }
    return output
}

function _atob(arr) {
    let output = ''
    const bytes = toUint8Array(arr)
    let i = 0
    while (i < bytes.length) {
        const d1 = bytes[i]
        const d2 = bytes[i + 1]
        const d3 = bytes[i + 2]
        const d4 = bytes[i + 3]

        if (isUnicode([d1, d2, d3, d4])) {
            const b1 = (0x07 & d1) << 18
            const b2 = (0x3f & d2) << 12
            const b3 = (0x3f & d3) << 6
            const b4 = 0x3f & d4
            const val = (b1 | b2 | b3 | b4) - 0x10000
            const H = (val >> 10) + 0xD800
            const L = (val & 0x03ff) + 0xDC00
            output += String.fromCharCode(H) + String.fromCharCode(L)
            i += 4
        } else if (isUnicode([d1, d2, d3])) {
            const b1 = (0x0f & d1) << 12
            const b2 = (0x3f & d2) << 6
            const b3 = 0x3f & d3
            output += String.fromCharCode(b1 | b2 | b3)
            i += 3
        } else {
            output += [d1, d2, d3, d4].filter(Number.isInteger).map(v => String.fromCharCode(v)).join('')
            i += 4
        }

    }
    return output
}

function btoa(str, urlSafe = false) {
    str = String(str)
    if (!str.length) return ''

    return fromUint8Array(str.split('').map(ch => ch.charCodeAt()), urlSafe)
}

function fromUint8Array(arr, urlSafe) {
    let output = ''
    let i = 1
    const stack = []
    while (i <= arr.length) {
        let charCode = arr[i - 1]

        // high surrogate check
        if (charCode >= 0xD800 && charCode <= 0xDBFF) {
            const L = arr[i]
            if (L && L >= 0xDC00 && L <= 0xDFFF) {
                charCode = 0x10000 + (charCode - 0xD800) * 0x400 + (L - 0xDC00)
                i += 1
            }
        }

        if (charCode >= 0x0800 && charCode <= 0xffff) {
            // 3-byte unicode
            const b1 = 0xe0 | charCode >> 12 & 0xf;
            const b2 = 0x80 | charCode >> 6 & 0x3f;
            const b3 = 0x80 | charCode & 0x3f;
            stack.push(b1, b2, b3)
            // 4-byte unicode
        } else if (charCode >= 0x10000 && charCode <= 0x10ffff) {
            const b1 = 0xf0 | charCode >> 18 & 0x7
            const b2 = 0x80 | charCode >> 12 & 0x3f
            const b3 = 0x80 | charCode >> 6 & 0x3f
            const b4 = 0x80 | charCode & 0x3f
            stack.push(b1, b2, b3, b4)
        } else stack.push(charCode)
        i += 1
    }
    let j = 0;
    while (j <= stack.length) {
        output += _btoa(stack.slice(j, j + 3), urlSafe)
        j += 3
    }
    return output
}

function _btoa(str, urlSafe) {
    if (!str?.length) return ''
    console.assert(str.length <= 3, `length of ${str} should smaller than 4`)
    /**
     * 0b (xxxxxx)| 
     *            |(xx0000)
     */
    const v1 = str[0]
    const ch1 = _encode(v1 >> 2, urlSafe)
    if (str.length === 1) {
        const ch2 = _encode((0x03 & v1) << 4, urlSafe)
        return [ch1, ch2, urlSafe ? '' : "=="].join('')
    }

    /**
     * 0b (xxxxxx)   |
     *            (xx|xxxx)
     *               |     (xxxx00)
     */
    const v2 = str[1]
    const ch2 = _encode(((0x03 & v1) << 4) | (v2 >> 4), urlSafe)
    if (str.length === 2) {
        const ch3 = _encode((0x0f & v2) << 2, urlSafe)
        return [ch1, ch2, ch3, '='].join('')
    }

    /**
     * 0b (xxxxxx)   |           |
     *            (xx|xxxx)      |
     *               |      (xxxx|xx)
     *               |           |   (xxxxxx)
     */
    const v3 = str[2]
    const ch3 = _encode(((0x0f & v2) << 2) | (v3 >> 6), urlSafe)
    const ch4 = _encode(0x3f & v3, urlSafe)
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

function _decode(ch, check = true) {
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

    check && console.assert(0, `invalid character ${ch}.`)
}

function encodeURI(str) {
    return btoa(str, true)
}

function isValid(str) {
    if (typeof str !== 'string') return false
    if (str.includes('+') && str.includes('-')) return false
    if (str.includes('/') && str.includes('_')) return false
    if (!str) return true
    return !str.split('').filter(ch => ch !== '=' && !Number.isInteger(_decode(ch, false))).length
}

function isUnicode(arr) {
    const [d1, d2, d3, d4] = arr
    if (arr.length === 1) return d1 < 2 ** 8
    const b2 = (d2 & 0x80) === 0x80
    if (arr.length === 2) return (d1 & 0xe0) && b2
    const b3 = (d3 & 0x80) === 0x80
    if (arr.length === 3) return (d1 & 0xe0) === 0xe0 && b2 && b3
    if (arr.length === 4) return (d1 & 0xf0) === 0xf0 && b2 && b3 && (d4 & 0x80) === 0x80
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