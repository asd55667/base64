function atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
}

function btoa(str) {
    return Buffer.from(str, 'binary').toString('base64');
}

module.exports = {
    atob,
    btoa
}