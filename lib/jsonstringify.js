module.exports = function jsonstringify(o) {
    if (typeof o === 'string') return o;
    try {
        return JSON.stringify(o, null, 4);
    } catch (e) {
        return o;
    }
};
