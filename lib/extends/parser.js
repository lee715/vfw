'use strict'
var P = require('../parser')
var modifier = require('./modifier')
var Extend = require('../extend')
var _ = require('../util')

// handle for 'type:pre:pre'
P.add(function (str, struct, ruleIns, depth) {
  if (!/^\w+(\:\w+)*$/.test(str)) return false
  var ps = str.split(':')
  var type = ps[0]
  var handler = Extend.getByName('type')
  if (!handler.get(type)) return false
  // modifier rule
  var modiObj = {}
  ps.slice(1).forEach(function (name) {
    name = _.toExpression(name)
    modiObj[name] = 1
  })
  var ruleInsModi = ruleIns.clone()
  ruleInsModi.setHandler(modifier, modiObj)
  ruleInsModi.addPath('$pand', depth)
  struct.add(ruleInsModi)
  // type rule
  ruleIns.setHandler(handler, type)
  ruleIns.addPath('$pand', depth)
  struct.add(ruleIns)
  return true
})
