const crypto = require("crypto")

function randomBytesGenerator(length) {
    return crypto.randomBytes(length).toString('hex')
}

function hash(data, salt, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, salt).update(data).digest('hex')
  }

  function createId(algorithm = 'sha256') {
    const uniqueId = crypto.randomBytes(16).toString('hex');
  
      const orderId = crypto.createHash(algorithm).update(uniqueId).digest('hex')
  
      return orderId.slice(0,12);
  }
  

module.exports = { randomBytesGenerator, hash , createId}