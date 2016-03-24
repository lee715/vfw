RuleType = require('./classes/ruletype')

Extends = []

TypeMap = {}

module.exports =

  map: TypeMap

  extend: (opts) ->
    opts or= {}
    ruleType = new RuleType(opts)
    Extends.push ruleType
    if opts.name
      TypeMap[opts.name] = ruleType
    return ruleType

  get: (rule) ->
    for handler in Extends
      return handler if handler.canHandle(rule)
    return null

  getByName: (name) ->
    return TypeMap[name]
