'use strict'
var RuleType = require('../classes/ruletype')
var _ = require('../util')

module.exports = new RuleType({
  _extended: {
    $in: function (target, arr) {
      return _.type('Array', arr) && arr.indexOf(target) !== -1
    },
    $eq: _.isEqual,
    $neq: function () {
      return !_.isEqual.apply(_, arguments)
    },
    $instanceof: function (target, Cla) {
      return target.prototype.constructor === Cla
    },
    $type: function (target, type) {
      var V = require('../index')
      return V.type(type, target)
    }
  },
  canHandle: function (rule) {
    return _.type('SinglePlainObject', rule) && this.has(rule)
  },
  get: _.singleKeyValWrap(function (key, val) {
    var handler = this._extended[key]
    return handler && _.partial(handler, _, val)
  }),
  has: _.singleKeyValWrap(function (key, val) {
    return !!this._extended[key]
  }),
  name: 'expression'
})
