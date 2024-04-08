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
        const d1 = String.fromCharCode(((0x3f & c1) << 2) | (c2 >> 4))
        if (arr[2] === '=' && arr[3] === '=') return d1

        const c3 = _decode(arr[2])
        /**
         * 0b 00(xxxxxx00 |          |
         * 0b        00xx)|(xxxx0000 |
         * 0b             |   00xxxx)|xx
        */
        const d2 = String.fromCharCode(((0x0f & c2) << 4) | (c3 >> 2))
        if (arr[3] === '=') return d1 + d2

        const c4 = _decode(arr[3])
        /**
         * 0b 00(xxxxxx00 |          |
         * 0b        00xx)|(xxxx0000 |
         * 0b             |   00xxxx)|(xx000000
         * 0b             |          | 00xxxxxx)  
        */
        const d3 = String.fromCharCode(((0x03 & c3) << 6) | c4)
        return d1 + d2 + d3
    }
}

// mask for input
const m1 = 0x03
const m2 = 0x0f
const m3 = 0x3f

function btoa(str) {
    str = String(str)
    if (!str.length) return ''

    /**
     * 0b (xxxxxx)| 
     *            |(xx0000)
     */
    const v1 = str[0].charCodeAt()
    const ch1 = _encode(v1 >> 2)
    if (str.length === 1) {
        const ch2 = _encode((m1 & v1) << 4)
        return [ch1, ch2, '=='].join('')
    }

    /**
     * 0b (xxxxxx)   |
     *            (xx|xxxx)
     *               |     (xxxx00)
     */
    const v2 = str[1].charCodeAt()
    const ch2 = _encode(((m1 & v1) << 4) | (v2 >> 4))
    if (str.length === 2) {
        const ch3 = _encode((m2 & v2) << 2)
        return [ch1, ch2, ch3, '='].join('')
    }

    /**
     * 0b (xxxxxx)   |           |
     *            (xx|xxxx)      |
     *               |      (xxxx|xx)
     *               |           |   (xxxxxx)
     */
    const v3 = str[2].charCodeAt()
    const ch3 = _encode(((m2 & v2) << 2) | (v3 >> 6))
    const ch4 = _encode(m3 & v3)
    return [ch1, ch2, ch3, ch4].join('') + btoa(str.slice(3))
}


function _encode(n) {
    console.assert(n >= 0 && n < 64, `${n} should be in range 0-63`);
    if (n >= 0 && n < 26) {
        return String.fromCharCode(n + 'A'.charCodeAt())
    } else if (n >= 26 && n < 52) {
        return String.fromCharCode(n - 26 + 'a'.charCodeAt())
    } else if (n >= 52 && n <= 61) {
        return String.fromCharCode(n - 52 + '0'.charCodeAt())
    }
    if (n === 62) return '+'
    if (n === 63) return '/'
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

    if (ch === '+') return 62
    if (ch === '-') return 63

    console.assert(0, `invalid character ${ch}.`)
}

module.exports = {
    atob,
    btoa,
}