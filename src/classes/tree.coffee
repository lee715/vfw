_ = require('lodash')
logic = require('../internal/logic')

class LeafNode
  constructor: (name) ->
    @name = name
    @_val = null
    @

  resolve: ->
    return @val()

  val: (value) ->
    if arguments.length
      @_val = value
    else
      return @_val

class TreeNode
  constructor: (name, val) ->
    @name = name
    if name is 'root'
      key = '$and'
    else
      key = logic.getKeyFromStr(name)
    op = logic.get(key)
    throw new Error("unvalid operation: #{key}") unless op
    @_op = op
    @_val = val = val or []
    @_map = {}
    val.forEach (v) =>
      @_map[v.name] = v
    @

  resolve: ->
    _val = @_val
    res = @_op.apply(null, _.map(_val, (val) ->
      return val.resolve()
    ))
    @status = res
    return res

  addChildNode: (child) ->
    _val = @_val
    _val.push child
    @_map[child.name] = child
    child._parent = @

  getChild: (name) ->
    return @_map[name]

class LogicTree
  constructor: ->
    @_root = new TreeNode('root')
    @_leafMap = {}

  initByChain: (chain, leafName) ->
    node = @_root
    for name in chain
      _node = node.getChild name
      if _node
        node = _node
      else
        _node = new TreeNode(name)
        node.addChildNode(_node)
        node = _node
    leaf = new LeafNode(leafName)
    @_leafMap[leaf.name] = leaf
    node.addChildNode(leaf)

  findErrorLeafs: ->
    _leafMap = @_leafMap
    errLeafs = []
    Object.keys(_leafMap).forEach (name) ->
      leaf = _leafMap[name]
      unless leaf.val()
        node = leaf._parent
        while node and not node.status
          if node.name is 'root'
            break
          node = node._parent
        if node.name is 'root'
          errLeafs.push leaf.name
    return errLeafs

  resolve: (valObj) ->
    for key, val of valObj
      leaf = @_leafMap[key]
      leaf.val(val) if leaf
    @_root.resolve()

module.exports = LogicTree