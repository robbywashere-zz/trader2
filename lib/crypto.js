const crypto = require('crypto');
const haikunator = new(require('haikunator'))();

function Haiku(tokenLength) {
  return haikunator.haikunate({
    tokenLength
  })
}

function Hash(str, salt = "") {
  return crypto.createHash('sha256').update(str + salt).digest("hex");
}

function Secret() {
  return crypto.randomBytes(64).toString('hex');
}

function Compare(str1="", str2="") {
  const len = Math.max(str1.length, str2.length)
  const buf1 = Buffer.alloc(len);

  const buf2 = Buffer.alloc(len);
  buf1.write(str1);
  buf2.write(str2);
  return crypto.timingSafeEqual(buf1, buf2);
}
module.exports = {
  Hash,
  Haiku,
  Compare,
  Secret
};
