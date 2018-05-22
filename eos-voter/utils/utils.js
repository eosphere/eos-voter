var exports = module.exports = {};

exports.to_engineering = (f) => {
    // Return a f formatted as a string in engineering notation
    // Defintion of engineering notation https://en.wikipedia.org/wiki/Engineering_notation
    if (f == 0) {
        return '0e+0';
    }
    let exponent = Math.floor(Math.log10(f));
    exponent = exponent - exponent % 3;
    mantissa = f / Math.pow(10, exponent);
    return mantissa.toFixed(3) + 'e' + (exponent >= 0 ? '+' : '') + exponent.toFixed(0)
}
