RuleType = require('../classes/ruletype')
_ = require('lodash')

# 空字符串 空对象 空数组则返true
isEmpty = (obj) ->
  if _.isArray(obj) and obj.length is 0
    return true
  if _.isPlainObject(obj)
    return true
  if obj is ''
    return true
  return false

# logic rules
module.exports = new RuleType(
  RESULT:
    VALID: 2
    UNVALID: 0
    PASS: 1
  DATA:
    $required: (target, required, r) ->
      if required and _.isUndefined target
        return r.UNVALID
      else if !required and _.isUndefined target
        return r.VALID
      else
        return r.PASS
    $empty: (target, empty, r) ->
      if not empty and isEmpty target
        return r.UNVALID
      else if empty and isEmpty target
        return r.VALID
      else
        return r.PASS
    $null: (target, canNull, r) ->
      isNull = _.isNull(target) or (_.isString(target) and target.toLowerCase() is 'null')
      if not canNull and isNull
        return r.UNVALID
      else if canNull and isNull
        return r.VALID
      else
        return r.PASS
  format: (preObj) ->
    _preObj = {}
    Object.keys(@DATA).forEach (key) =>
      _preObj[key] = preObj[key] or false
    return _preObj
  check: (preObj, arr) ->
    unless Array.isArray(arr)
      arr = [arr]
    _preObj = @format(preObj)
    for key, val of _preObj
      handler = @get(key)
      return false unless handler
      handler = _.partial handler, _, val, @RESULT
      rt = _.reduce _.map(arr, handler), (a, b) ->
        return a or b
      if rt is @RESULT.PASS
        continue
      else
        return rt
    return @RESULT.PASS
  name: 'addition'
)