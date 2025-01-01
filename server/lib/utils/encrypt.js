const crypto = require("crypto")

function randomBytesGenerator(length) {
    return crypto.randomBytes(length).toString('hex')
}

function createHashGenerator(algorithm, id){
    return crypto.createHash(algorithm).update(id).digest('hex').slice(0, 12);
}

function hash(data, salt, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, salt).update(data).digest('hex')
  }

  function createId(algorithm = 'sha256') {
    const uniqueId = randomBytesGenerator(16);
  
      const orderId = createHashGenerator(algorithm, uniqueId);
  
      return orderId.slice(0,12);
  }
function generateInviteToken(id){
  return createHashGenerator('sha256', id);
}
  

module.exports = { randomBytesGenerator, hash , createId, generateInviteToken}