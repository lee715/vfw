Extend = require('./extend')
Parser = require('./parser')
RuleSet = require('./classes/ruleset')
Rule = require('./classes/rule')
require('./internal/ruletype')
_ = require('lodash')

V = module.exports = {}

Object.keys(Extend.map).forEach((name) ->
  V[name] = ->
    handler = Extend.map[name]
    handler.check.apply(handler, arguments)
)

V.check = ->

# get handler for rule
V.get = (rule) ->
  return V.Extend.get(rule)

V.Extend = Extend

V.extendParser = (fn) ->
  Parser.add(fn)

V.extend = (type) ->
  ruleType = Extend.getByName(type)
  args = [].slice.call(arguments, 1)
  ruleType.extend.apply(ruleType, args)

V.include = (type) ->
  ruleType = Extend.getByName(type)
  args = [].slice.call(arguments, 1)
  ruleType.include.apply(ruleType, args) if ruleType.include

V.parse = (obj) ->
  return null unless obj
  depth = 0
  ruleSet = new RuleSet()
  # 递归地解析传入的规则对象
  _parse = (data, ruleIns) ->
    depth++
    handler = Extend.get(data)
    if handler
      ruleIns.setHandler(handler, data)
      return ruleSet.add(ruleIns)
    parsers = Parser.get()
    for parser in parsers
      parsed = parser(data, ruleSet, ruleIns)
      return if parsed
    if _.isArray data
      data.forEach (item, ind) ->
        _ruleIns = ruleIns.clone(ind)
        _ruleIns.addPath(ind, depth)
        _parse item, _ruleIns
    else if _.isPlainObject(data)
      keys = Object.keys(data)
      if keys.length is 1
        keys.forEach (key, ind) ->
          _ruleIns = ruleIns.clone(ind)
          _ruleIns.addPath(key, depth)
          _parse data[key], _ruleIns
      else
        keys.forEach (key, ind) ->
          _ruleIns = ruleIns.clone(ind)
          _rule = {}
          _rule[key] = data[key]
          _parse _rule, _ruleIns
    else
      throw new Error("unrecognized rule: #{data}")
  _parse(obj, new Rule())
  return ruleSet