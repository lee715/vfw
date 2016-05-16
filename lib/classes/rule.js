'use strict'
var _ = require('../util')
var Logic = require('../extends/logic')
module.exports = Rule

function Rule (opts) {
  opts = opts || {}
  if (_.type('String', opts.path)) {
    opts.path = opts.path.split('.')
  }
  this._path = opts.path || []
  this._rule = opts.rule
  this._hdl = opts.handler || null
  return this
}

Rule.prototype.check = function (target) {
  if (!this._finished) {
    this.finish()
  }
  var targ = _.resolvePath(this._path, target)
  if (!this._isMulti) targ = [targ]
  return this._hdl.check(targ, this._rule)
}

Rule.prototype.toJSON = function () {
  let data = {
    rule: this._rule,
    path: this._path,
    name: this._name
  }
  return data
}

Rule.prototype.clone = function () {
  var opts = {
    rule: _.clone(this._rule),
    path: _.clone(this._path),
    handler: this._hdl
  }
  return new Rule(opts)
}

Rule.prototype.addPath = function (path, depth) {
  if (this._finished) return this
  var _path = this._path
  if (Logic.has(path)) {
    _path.push(`${path}${depth || 0}`)
  } else {
    var lastPath = _.last(_path)
    if (!Logic.has(lastPath)) {
      _path.push(`$and${depth || 0}`)
    }
    _path.push(path)
  }
  return this
}

// when finished, the rule is locked, and cant set or add any more
Rule.prototype.finish = function () {
  if (this._finished) return this
  this._name = this._hdl.name
  var logicChain = this._logicChain = []
  var paths = []
  this._path.forEach(function (path) {
    if (path === '$array') {
      paths.push(path)
    } else if (_.type('Expression', path)) {
      var key = Logic.str2key(path)
      if (key) {
        logicChain.push(path)
      }
    } else {
      paths.push(path)
    }
  })
  this._path = paths.join('.')
  this._isMulti = ~this._path.indexOf('$array')
  this._finished = true
  return this
}

Rule.prototype.setHandler = function (handler, rule) {
  if (this._finished) return this
  this._hdl = handler
  this._rule = rule
  return this
}
