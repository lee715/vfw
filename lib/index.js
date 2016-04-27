'use strict'
var Extended = require('./extend')
var Parser = require('./parser')
var Struct = require('./classes/struct')
var Rule = require('./classes/rule')
var _ = require('./util')
var assert = require('assert')
require('./extends/parser')
var $ = require('./extends/expression')
var modifier = require('./extends/modifier')

var V = module.exports = {}

Object.keys(Extended.map).forEach(function (name) {
  V[name] = function (type, target) {
    var handler = Extended.map[name]
    if (arguments.length === 1) {
      return handler
    }
    return handler.check([target], type)
  }
})

V.$ = _.singleKeyValWrap(function (key, val, target) {
  if (!/^\$/.test(key)) {
    key = '$' + key
  }
  var handler = $.get(key, val)
  if (arguments.length === 2) {
    return handler
  }
  return handler && handler(target)
})

V.check = function () {}

V.get = function (rule) {
  return Extended.get(rule)
}

V.extendParser = function (fn) {
  Parser.add(fn)
}

V.extendRule = function (opts) {
  var ruleType = Extended.extend(opts)
  if (opts && opts.name) {
    V[opts.name] = ruleType
  }
  return ruleType
}

V.extend = function (type) {
  var ruleType = null
  if (type === 'modifier') {
    ruleType = modifier
  } else {
    ruleType = Extended.getByName(type)
  }
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
  if (obj instanceof Struct) return obj
  var depth = 0
  var struct = new Struct()
  _parse(obj, new Rule())
  return struct

  function _parse (data, ruleIns) {
    depth++
    var parsers = Parser.get()
    for (var i = 0, l = parsers.length; i < l; i++) {
      if (parsers[i](data, struct, ruleIns)) return
    }
    var handler = Extended.get(data)
    if (handler) {
      ruleIns.setHandler(handler, data)
      return struct.add(ruleIns)
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
