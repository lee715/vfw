'use strict'
var Parsers = []

module.exports = {
  get: function () {
    return Parsers
  },
  add: function (parser) {
    Parsers.push(parser)
  }
}
