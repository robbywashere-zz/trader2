const crypto = require('crypto');
module.exports = function quickId(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}