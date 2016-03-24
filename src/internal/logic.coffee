RuleType = require('../classes/ruletype')
_ = require('lodash')
u = require('../util')

# logic rules
module.exports = new RuleType(
  DATA:
    $and: ->
      args = u.slice(arguments)
      return _.reduce(args, (a, b) ->
        return a and b
      )
    $or: ->
      args = u.slice(arguments)
      return _.reduce(args, (a, b) ->
        return a or b
      )
    $xor: ->
      args = u.slice(arguments)
      return _.reduce(args, (a, b) ->
        return a ^ b
      )
  has: (rule) ->
    !!@get(rule)
  get: (rule) ->
    return null unless rule and _.isString(rule)
    matches = rule.match(/^\$[a-zA-Z]+/)
    return null unless matches
    return @DATA[matches[0]]
  canHandle: (rule) ->
    @has(rule)
  getKeyFromStr: (name) ->
    keys = Object.keys(@DATA)
    for key in keys
      if name.indexOf(key) is 0
        return key
    return null
  name: 'logic'
)