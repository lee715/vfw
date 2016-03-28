'use strict'
var _ = require('../util')
var Logic = require('../extends/logic')
var assert = require('assert')

function LeafNode (name) {
  this.name = name
  this._val = null
  return this
}

LeafNode.prototype.resolve = function () {
  return this.val()
}

LeafNode.prototype.val = function (value) {
  if (arguments.length) {
    this._val = value
  } else {
    return this._val
  }
}

function TreeNode (name, val) {
  this.name = name
  var key = '$and'
  if (name !== 'root') {
    key = Logic.str2key(name)
  }
  var op = Logic.get(key)
  assert(op, 'invalid key: ' + key)
  this._op = op
  this._val = val = val || []
  var map = this._map = {}
  val.forEach(function (v) {
    map[v.name] = v
  })
  return this
}

TreeNode.prototype.resolve = function () {
  var _val = this._val
  var res = this._op.apply(null, _.map(_val, function (val) {
    return val.resolve()
  }))
  this.status = res
  return res
}

TreeNode.prototype.addChildNode = function (child) {
  var _val = this._val
  _val.push(child)
  this._map[child.name] = child
  child._parent = this
  return this
}

TreeNode.prototype.getChild = function (name) {
  return this._map[name]
}

function LogicTree () {
  this._root = new TreeNode('root')
  this._leafMap = {}
  return this
}

LogicTree.prototype.initByChain = function (chain, leafName) {
  assert(_.isArray(chain), 'chain must be array')
  var node = this._root
  chain.forEach(function (name) {
    var _node = node.getChild(name)
    if (_node) {
      node = _node
    } else {
      _node = new TreeNode(name)
      node.addChildNode(_node)
      node = _node
    }
  })
  var leaf = new LeafNode(leafName)
  this._leafMap[leaf.name] = leaf
  node.addChildNode(leaf)
  return this
}

LogicTree.prototype.findErrorLeafs = function () {
  var _leafMap = this._leafMap
  var errLeafs = []
  Object.keys(_leafMap).forEach(function (name) {
    var leaf = _leafMap[name]
    if (!leaf.val()) {
      var node = leaf._parent
      while (node && !node.status) {
        if (node.name === 'root') break
        node = node._parent
      }
      if (node.name === 'root') {
        errLeafs.push(leaf.name)
      }
    }
  })
  return errLeafs
}

LogicTree.prototype.resolve = function (valObj) {
  var self = this
  Object.keys(valObj).forEach(function (key) {
    var val = valObj[key]
    var leaf = self._leafMap[key]
    if (leaf) leaf.val(val)
  })
  return this._root.resolve()
}

module.exports = LogicTree
