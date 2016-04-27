'use strict'
var _ = require('../util')
var RuleType = require('../classes/ruletype')
var Struct = require('../classes/struct')

module.exports = new RuleType({
  canHandle: function (rule) {
    return rule instanceof Struct
  },
  check: _.arg2arrWrap(function (arr, rule) {
    var handler = this.get(rule)
    if (!handler) return false
    return _.reduce(_.mapPure(arr, handler.check.bind(handler)), _.and)
  }),
  extend: _.argMapObjWrap(function (key, val) {
    var V = require('../index')
    this._extended[key] = V.parse(val)
  }),
  name: 'struct'
})
