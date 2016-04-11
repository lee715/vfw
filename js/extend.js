'use strict'
var RuleType = require('./classes/ruletype')
var type = require('./extends/type')
var expression = require('./extends/expression')
var addition = require('./extends/addition')
var assert = require('assert')
var Extends = []
var TypeMap = {}

module.exports = {
  map: TypeMap,
  extend: function (opts) {
    assert(opts)
    opts = opts || {}
    var ruleType = null
    if (opts instanceof RuleType) {
      ruleType = opts
    } else {
      ruleType = new RuleType(opts)
    }
    Extends.push(ruleType)
    if (opts.name) {
      TypeMap[opts.name] = ruleType
    }
    return ruleType
  },
  get: function (rule) {
    for (var i = 0, l = Extends.length; i < l; i++) {
      var handler = Extends[i]
      if (handler.canHandle(rule)) return handler
    }
    return null
  },
  getByName: function (name) {
    return TypeMap[name]
  }
}
module.exports.extend(type)
module.exports.extend(expression)
module.exports.extend(addition)
