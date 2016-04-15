'use strict'
var Extended = require('./extend')
var Parser = require('./parser')
var RuleSet = require('./classes/ruleset')
var Rule = require('./classes/rule')
var _ = require('./util')
var assert = require('assert')
require('./extends/type')
var $ = require('./extends/expression')
var addition = require('./extends/addition')

var V = module.exports = {}

Object.keys(Extended.map).forEach(function (name) {
  V[name] = function (type, targets) {
    var handler = Extended.map[name]
    return handler.check(targets, type)
  }
})

V.$ = _.singleKeyValWrap(function (key, val, target) {
  if (!/^\$/.test(key)) {
    key = '$' + key
  }
  var handler = $.get(key, val)
  return handler && handler(target)
})

V.check = function () {}

V.get = function (rule) {
  return Extended.get(rule)
}

V.extendParser = function (fn) {
  Parser.add(fn)
}

V.extendAddition = function () {
  addition.extend.apply(addition, arguments)
}

V.extend = function (type) {
  var ruleType = Extended.getByName(type)
  assert(ruleType, 'ruleType not found for name: ' + type)
  var args = _.slice(arguments, 1)
  ruleType.extend.apply(ruleType, args)
}

V.include = function (type) {
  var ruleType = Extended.getByName(type)
  assert(ruleType, 'ruleType not found for name: ' + type)
  var args = _.slice(arguments, 1)
  ruleType.include.apply(ruleType, args)
}

V.parse = function (obj) {
  if (!obj) return null
  var depth = 0
  var ruleSet = new RuleSet()
  _parse(obj, new Rule())
  return ruleSet

  function _parse (data, ruleIns) {
    depth++
    var handler = Extended.get(data)
    if (handler) {
      ruleIns.setHandler(handler, data)
      return ruleSet.add(ruleIns)
    }
    var parsers = Parser.get()
    for (var i = 0, l = parsers.length; i < l; i++) {
      if (parsers[i](data, ruleSet, ruleIns)) return
    }
    if (_.type('Array', data)) {
      data.forEach(function (item, ind) {
        var _r = ruleIns.clone(ind)
        _r.addPath(ind, depth)
        _parse(item, _r)
      })
    } else if (_.type('PlainObject', data)) {
      var keys = Object.keys(data)
      if (keys.length === 1) {
        var key = keys[0]
        var _r = ruleIns.clone(0)
        _r.addPath(key, depth)
        _parse(data[key], _r)
      } else {
        keys.forEach(function (key, ind) {
          var _r = ruleIns.clone(ind)
          var _rule = {}
          _rule[key] = data[key]
          _parse(_rule, _r)
        })
      }
    } else {
      throw new Error('unrecognized rule: ' + data)
    }
  }
}
