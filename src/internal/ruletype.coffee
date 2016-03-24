_ = require('lodash')
Extender = require('../extend')

# type rules
Type = Extender.extend(
  canHandle: (rule) ->
    return false unless _.isString(rule)
    return /^[0-9a-zA-Z]+$/.test(rule)
  name: 'type'
)

# expression rules
Expression = Extender.extend(
  DATA:
    $in: (target, arr) ->
      return target in arr
    $eq: _.isEqual
    $neq: ->
      return not _.isEqual.apply(_, arguments)
  canHandle: (rule) ->
    return false unless _.isPlainObject(rule)
    keys = Object.keys(rule)
    return false if keys.length isnt 1
    return @has(rule)
  get: (rule) ->
    {DATA} = @
    for key, val of rule
      handler = DATA[key]
      return null unless handler
      return _.partial(handler, _, val)
  has: (rule) ->
    {DATA} = @
    for key, val of rule
      return !!DATA[key]
  name: 'expression'
)

Fn = Extender.extend(
  canHandle: (rule) ->
    _.isFunction(rule)
  check: (rule, arr) ->
    unless Array.isArray(arr)
      arr = [arr]
    _.reduce _.map(arr, rule), (a, b) ->
      return a and b
  name: 'function'
)

