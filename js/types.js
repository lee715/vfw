'use strict'
var _ = require('lodash')

var t = module.exports = {
  Word: function (target) {
    return target && /^\w+$/.test(target)
  },
  SinglePlainObject: function (target) {
    return _.isPlainObject(target) && Object.keys(target).length === 1
  },
  Expression: function (target) {
    return target && /^\$\w+$/.test(target)
  }
}

Object.keys(_).forEach(function (key) {
  if (/^is\w+/.test(key)) {
    var _key = key.slice(2)
    t[_key] = _[key]
  }
})
