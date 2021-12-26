const svgo = require('svgo')

module.exports = function compress(data) {
  return svgo.optimize(sourceFile.data, {
    multipass: true,
  })
}