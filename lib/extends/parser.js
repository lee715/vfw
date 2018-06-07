'use strict'
var P = require('../parser')
var modifier = require('./modifier')
var Extend = require('../extend')
var _ = require('../util')

// handle for 'type:pre:pre'
P.add(function (str, struct, ruleIns, depth) {
  if (!/^[a-zA-Z]{1}\w+(\:\w+)*$/.test(str)) return false
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

P.add(function (obj, struct, ruleIns, depth) {
  if (!(_.isPlainObject(obj) && obj['$type']) && !obj['$array']) return false
  var modiObj = {}
  var hasModifier = false
  if (obj['$array']) {
    modiObj['$empty'] = 1
    hasModifier = true
  }
  Object.keys(obj).forEach(function (key) {
    if (modifier.has(key)) {
      delete obj[key]
      modiObj[key] = 1
      hasModifier = true
    }
  })
  if (obj['$type']) {
    var handler = Extend.getByName('type')
    var type = obj['$type']
    if (/^\w+(\:\w+)+$/.test(type)) {
      var ps = type.split(':')
      type = ps[0]
      if (handler.get(type)) {
        ps.slice(1).forEach(function (name) {
          name = _.toExpression(name)
          modiObj[name] = 1
          hasModifier = true
        })
      }
    }
  }
  if (!hasModifier) return false
  var ruleInsModi = ruleIns.clone()
  ruleInsModi.setHandler(modifier, modiObj)
  ruleInsModi.addPath('$pand', depth)
  struct.add(ruleInsModi)
  ruleIns.addPath('$pand', depth)
  if (type) {
    // type rule
    ruleIns.setHandler(handler, type)
    struct.add(ruleIns)
    delete obj['$type']
  }
  if (Object.keys(obj).length) {
    return obj
  } else {
    return true
  }
})
