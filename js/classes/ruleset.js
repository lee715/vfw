'use strict'
var assert = require('assert')
var _ = require('../util')
var Tree = require('./tree')
var Rule = require('./rule')
module.exports = RuleSet

function RuleSet (obj) {
  this.uid = _.uniqueId('RuleSet_')
  this._tree = new Tree()
  this._rules = []
  this._ruleMap = {}
  return this
}

RuleSet.prototype.uniqRule = function () {
  return _.uniqueId(this.uid + '_')
}

RuleSet.prototype.add = function (ruleIns) {
  assert(ruleIns instanceof Rule, 'ruleIns must be instance of Rule')
  ruleIns.finish()
  ruleIns.uid = this.uniqRule()
  this._rules.push(ruleIns)
  this._ruleMap[ruleIns.uid] = ruleIns
  this._tree.initByChain(ruleIns._logicChain, ruleIns.uid)
  return this
}

RuleSet.prototype.check = function (obj) {
  var self = this
  var rules = this._rules
  var valObj = {}
  rules.forEach(function (rule) {
    var rt = rule.check(obj)
    valObj[rule.uid] = rt
  })
  var res = !!this._tree.resolve(valObj)
  var errs = null
  if (!res) {
    var uids = this._tree.findErrorLeafs()
    errs = _.map(uids, function (uid) {
      return self._ruleMap[uid].toJSON()
    })
  }
  return [res, errs]
}
