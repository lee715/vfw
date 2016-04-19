'use strict'
var _ = require('../util')
var assert = require('assert')
module.exports = RuleType

function RuleType (opts) {
  assert(opts)
  opts = opts || {}
  // restore included third-part modules
  this._includes = []
  // restore extended methods
  this._extended = {}
  this._name = 'rule'
  _.assign(this, opts)
  return this
}

RuleType.prototype.has = function (rule) {
  !!this.get(rule)
}

RuleType.prototype.canHandle = function (rule) {
  throw new Error('canHandle api need rewrite')
}

RuleType.prototype.check = _.arg2arrWrap(function (arr, rule) {
  var handler = this.get(rule)
  if (!handler) return false
  return _.reduce(_.mapPure(arr, handler), _.and)
})

RuleType.prototype.get = function (rule) {
  if (!rule || !_.isString(rule)) return null
  var handler = this._extended[rule]
  if (handler) return handler
  var includes = this._includes
  for (var i = 0, l = includes.length; i < l; i++) {
    handler = includes[i][rule]
    if (handler) return handler
  }
  return null
}

RuleType.prototype.include = function (third) {
  assert(_.isObject(third), 'in include api, the argument must be object')
  this._includes.push(third)
}

RuleType.prototype.extend = _.argMapObjWrap(function (key, val) {
  this._extended[key] = val
})

RuleType.prototype.str2key = function (str) {
  assert(_.isString(str), 'in str2key api, the argument must be string')
  if (!/^\$/.test(str)) str = '$' + str
  return str
}

RuleType.prototype.key2str = function (key) {
  assert(_.isString(key), 'in key2str api, the argument must be string')
  if (/^\$/.test(key)) key = key.slice(1)
  return key
}
