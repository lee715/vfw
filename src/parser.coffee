Extend = require('./extend')
Parsers = []

P = module.exports =
  get: ->
    return Parsers
  add: (parser) ->
    Parsers.push parser

# handle for 'type:pre:pre'
P.add (str, ruleSet, ruleIns) ->
  unless /^\w+(\:\w+)+$/.test(str)
    return false
  ps = str.split(':')
  type = ps[0]
  pres = ps[1..].map((pre) -> '$' + pre)
  handler = Extend.getByName('type')
  return false unless handler.get(type)
  ruleIns.setHandler(handler, type)
  ruleIns.addAdditions(pres)
  ruleSet.add(ruleIns)
  return true

