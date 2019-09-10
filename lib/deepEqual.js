function deepEqual(o1, o2) {
  const assert = require('assert');
  try {
    assert.deepEqual(o1, o2);
    return true;
  } catch (e) {
    return false;
  }
}
exports.deepEqual = deepEqual;