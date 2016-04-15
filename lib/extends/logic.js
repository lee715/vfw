'use strict'
var RuleType = require('../classes/ruletype')
var _ = require('../util')

module.exports = new RuleType({
  _extended: {
    $and: _.and,
    $or: _.or,
    $xor: _.xor
  },
  has: function (rule) {
    return !!this.get(rule)
  },
  get: function (rule) {
    if (!rule || !_.isString(rule)) return null
    var matches = rule.match(/^\$[a-zA-Z]+/)
    if (!matches) return null
    return this._extended[matches[0]]
  },
  canHandle: function (rule) {
    return this.has(rule)
  },
  str2key: function (name) {
    var keys = Object.keys(this._extended)
    for (var i = 0, l = keys.length; i < l; i++) {
      if (_.startsWith(name, keys[i])) {
        return keys[i]
      }
    }
    return null
  },
  name: 'logic'
})
