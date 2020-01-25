module.exports = function jsonstringify(o) {
    try {
        return JSON.stringify(o, null, 4);
    } catch (e) {
        return o + '';
    }
};
