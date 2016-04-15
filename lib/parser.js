'use strict'
var Extend = require('./extend')
var Parsers = []
var _ = require('./util')

var P = module.exports = {
  get: function () {
    return Parsers
  },
  add: function (parser) {
    Parsers.push(parser)
  }
}

// handle for 'type:pre:pre'
P.add(function (str, ruleSet, ruleIns) {
  if (!/^\w+(\:\w+)+$/.test(str)) return false
  var ps = str.split(':')
  var type = ps[0]
  var pres = ps.slice(1).map(_.toExpression)
  var handler = Extend.getByName('type')
  if (!handler.get(type)) return false
  ruleIns.setHandler(handler, type)
  ruleIns.addAdditions(pres)
  ruleSet.add(ruleIns)
  return true
})
