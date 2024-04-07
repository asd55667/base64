// mask for input
const m1 = 0x03
const m2 = 0x0f
const m3 = 0x3f

function atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
}

function btoa(str) {
    str = String(str)
    if (!str.length) return ''

    /**
     * b' (xxxxxx)| 
     *            |(xx0000)
     */
    const v1 = str[0].charCodeAt()
    const ch1 = encode(v1 >> 2)
    if (str.length === 1) {
        const ch2 = encode((m1 & v1) << 4)
        return [ch1, ch2, '=='].join('')
    }

    /**
     * b' (xxxxxx)   |
     *            (xx|xxxx)
     *               |     (xxxx00)
     */
    const v2 = str[1].charCodeAt()
    const ch2 = encode(((m1 & v1) << 4) | (v2 >> 4))
    if (str.length === 2) {
        const ch3 = encode((m2 & v2) << 2)
        return [ch1, ch2, ch3, '='].join('')
    }

    /**
     * b' (xxxxxx)   |           |
     *            (xx|xxxx)      |
     *               |      (xxxx|xx)
     *               |           |   (xxxxxx)
     */
    const v3 = str[2].charCodeAt()
    const ch3 = encode(((m2 & v2) << 2) | (v3 >> 6))
    const ch4 = encode(m3 & v3)
    return [ch1, ch2, ch3, ch4].join('') + btoa(str.slice(3))
}


function encode(n) {
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

module.exports = {
    atob,
    btoa
}