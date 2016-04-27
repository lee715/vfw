'use strict'
var _ = require('lodash')
var t = require('./types')
var assert = require('assert')
module.exports = _

_.slice = function (arr) {
  var args = [].slice.call(arguments, 1)
  return [].slice.apply(arr, args)
}

_.singleKeyValWrap = function (fn) {
  return function (key) {
    if (_.isPlainObject(key)) {
      return fn.apply(this, _.getSingleKeyVal(key).concat(_.slice(arguments, 1)))
    } else if (_.isString(key)) {
      return fn.apply(this, arguments)
    } else {
      assert(false, 'first argument must be plainObject or string')
    }
  }
}

_.arg2arrWrap = function (fn) {
  return function (arg) {
    if (!_.isArray(arg)) {
      arg = [arg]
    }
    var rest = _.slice(arguments, 1)
    rest.unshift(arg)
    return fn.apply(this, rest)
  }
}

_.argMapObjWrap = function (fn) {
  return function (obj) {
    var self = this
    if (_.isString(obj)) {
      return fn.apply(this, arguments)
    } else if (_.isObject(obj)) {
      var rest = _.slice(arguments, 1)
      Object.keys(obj).forEach(function (key) {
        fn.apply(self, [key, obj[key]].concat(rest))
      })
    }
  }
}

_.and = function () {
  return _.reduce(arguments, function (a, b) {
    return a && b
  })
}

_.or = function () {
  return _.reduce(arguments, function (a, b) {
    return a || b
  })
}

_.xor = function () {
  return _.reduce(arguments, function (a, b) {
    return a ^ b
  })
}

// 0 invalid, 1 valid, 2 pass
// 0,1 b => 0,1; 2 b => b
_.pand = function () {
  var len = arguments.length
  for (var i = 0; i < len; i++) {
    if (arguments[i] !== 2) {
      return arguments[i]
    }
  }
  return 2
}

_.getSingleKeyVal = function (obj) {
  assert(_.isObject(obj), 'obj must be object')
  var key = Object.keys(obj)[0]
  return [key, obj[key]]
}

_.mapPure = function (arr, fn) {
  return _.map(arr, function (item) { return fn(item) })
}

_.type = function (type, target) {
  assert(t['String'](type), 'type must be string')
  return t[type] && t[type](target)
}

_.toExpression = function (name) {
  assert(_.type('String', name), 'name must be string')
  return '$' + name
}

_.resolvePath = function (path, obj) {
  if (!path || !obj) return obj
  if (_.isArray(path)) path = path.join('.')
  if (~path.indexOf('$array')) {
    var pis = path.split(/^\$array\.|\$array|\.\$array$/)
    var rt = obj
    var curriedResult = _.curryRight(_.result)(undefined)
    var max = pis.length - 1
    pis.forEach(function (p, ind) {
      p = p.replace(/^\.+|\.+$/g, '')
      // p为空且不以$array开头的情况
      if (p === '' && ind <= max) {
        rt = [].concat.apply([], rt)
      } else {
        if (_.isArray(rt)) {
          rt = _.map(rt, function (r) {
            return curriedResult(p)(r)
          })
          // 如果不是最后一次，则展开结果数组
          if (ind < max) {
            rt = [].concat.apply([], rt)
          }
        } else if (_.isObject(rt)) {
          rt = _.result(rt, p)
        }
      }
    })
    return rt
  } else {
    return _.result(obj, path)
  }
}
