_ = require('lodash')
u = require('../util')

class RuleType

  name: 'ruleType'

  constructor: (opts) ->
    opts or= {}
    _.assign(@, opts)
    @INCLUDES or= []
    @DATA or= {}
    @

  has: (rule) ->
    {DATA, INCLUDES} = @
    return false unless rule
    return true if DATA[rule]
    for include in INCLUDES
      if include[rule]
        return true
    return false

  extend: u.argsWrap((key, val) ->
    @DATA[key] = val
  )

  canHandle: (rule) ->
    throw new Error('canHandle api need rewrite')

  check: (rule, arr) ->
    unless Array.isArray(arr)
      arr = [arr]
    handler = @get(rule)
    return false unless handler
    return _.reduce _.map(arr, handler), (a, b) ->
      return a and b

  get: (rule) ->
    {DATA, INCLUDES} = @
    return null unless rule
    return DATA[rule] if DATA[rule]
    for include in INCLUDES
      if include[rule]
        return include[rule]
    return null

  include: (third) ->
    @INCLUDES.push(third) if _.isObject(third)

  formatKey: (key) ->
    unless key.charAt(0) is '$'
      return '$' + key
    return key

module.exports = RuleType