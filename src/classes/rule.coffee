_ = require('lodash')
u = require('../util')
Extend = require('../extend')
logic = require('../internal/logic')
addition = require('../internal/addition')

class Rule

  constructor: (opts) ->
    opts or= {}
    if opts.path and _.isString(opts.path)
      opts.path = opts.path.split('.')
    @_path = opts.path or []
    @_rule = opts.rule
    @_addition = opts.addition or {}
    @_hdl = opts.handler or null
    @

  check: (target) ->
    { _addition, _rule } = @
    tar = u.resolvePath(@_path, target)
    @_target = tar
    unless @_isMulti
      tar = [tar]
    hasAddi = Object.keys(_addition).length
    if hasAddi
      rt = addition.check(_addition, tar)
      if rt isnt addition.RESULT.PASS
        return !!rt
    return @_hdl.check(@_rule, tar)

  toJSON: ->
    data =
      addition: @_addition
      rule: @_rule
      path: @_path
    return data

  setHandler: (handler, rule) ->
    @_hdl = handler
    @_rule = rule

  addAdditions: (arr) ->
    unless Array.isArray(arr)
      arr = [arr]
    arr.forEach (key) =>
      @_addition[key] = 1

  clone: (ind) ->
    if @_finished
      return null
    opts =
      addition: _.clone(@_addition)
      rule: _.clone(@_rule)
      path: _.clone(@_path)
      handler: @_hdl
    return new Rule(opts)

  addPath: (key, depth) ->
    lastKey = _.last @_path
    unless logic.has(lastKey)
      @_path.push "$and#{depth}"
    @_path.push key

  finish: ->
    return if @_finished
    @_logicChain = []
    _path = []
    for path in @_path
      if path is '$array'
        _path.push path
      else if /^\$\w+$/.test(path)
        key = logic.getKeyFromStr(path)
        if key
          @_logicChain.push key
        else
          @_addition[path.replace('$', '')] = 1
      else
        _path.push path
    @_path = _path.join('.')
    @_isMulti = ~_path.indexOf('$array')
    @_finished = true
    return @

module.exports = Rule
