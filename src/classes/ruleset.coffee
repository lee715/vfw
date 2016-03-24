_ = require('lodash')
u = require('../util')
Extend = require('../extend')
Tree = require('./tree')
Rule = require('./rule')
parsers = require('../parser').get()

afterLogic = (path) ->
  return false if path.length is 0
  Extend.getByName('logic').has _.last(path)

class RuleSet

  constructor: (obj) ->
    @uid = _.uniqueId('RuleSet_')
    @_treeHdl = new Tree
    @_rules = []
    @_ruleMap = {}
    @parse(obj)
    @

  uniqRule: ->
    _.uniqueId(@uid + '_')

  _add: (ruleIns) ->
    {_path, _rule, _logicChain, _addition} = ruleIns
    ruleIns.uid = @uniqRule()
    @_rules.push ruleIns
    @_ruleMap[ruleIns.uid] = ruleIns
    @_treeHdl.initByChain(_logicChain, ruleIns.uid)
    @

  check: (obj) ->
    rules = @_rules
    valObj = {}
    rules.forEach (rule) ->
      rt = rule.check(obj)
      valObj[rule.uid] = rt
    res = !!@_treeHdl.resolve(valObj)
    unless res
      uids = @_treeHdl.findErrorLeafs()
    errs = _.map uids, (uid) =>
      return @_ruleMap[uid].toJSON()
    return [res, errs]

  add: (ruleIns) ->
    @_add(ruleIns.finish())

  parse: (obj) ->
    return null unless obj

    depth = 0
    ruleSet = @
    # 递归地解析传入的规则对象
    _parse = (data, ruleIns) ->
      depth++
      if _.isArray data
        data.forEach (item, ind) ->
          _ruleIns = ruleIns.clone(ind)
          _ruleIns.addPath(ind, depth)
          _parse item, _ruleIns
      else
        handler = ruleSet._q.getHandler(data, 'check')
        if handler
          ruleIns.addHandler(handler)
          ruleSet.end(ruleIns)
        else if _.isPlainObject(data)
          keys = Object.keys(data)
          if ruleSet._q.isRuleWithPrecheck(keys)
            keys.forEach (key) ->
              handler = ruleSet._q.getHandlerByKey(key)
              stage = handler.getStage()
              if stage is 'check'
                ruleIns.addHandler(handler)
              else
                ruleIns.addRuleByStage(key, data[key], stage)
            ruleSet.end(ruleIns)
          else
            keys.forEach (key, ind) ->
              _ruleIns = ruleIns.clone(ind)
              _ruleIns.addPath(key, depth)
              _parse data[key], _ruleIns
        else
          for parser in parsers
            parsed = parser(data, ruleSet, ruleIns)
            return if parsed
          throw new Error('unrecognized rule')

    _parse(obj, new Rule())

module.exports = RuleSet