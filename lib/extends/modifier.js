'use strict'
var RuleType = require('../classes/ruletype')
var _ = require('../util')

module.exports = new RuleType({
  RESULT: {
    VALID: 1,
    UNVALID: 0,
    PASS: 2
  },
  _extended: {
    $required: function (target, required, r) {
      var isUndefined = _.type('Undefined', target)
      if (required && isUndefined) {
        return r.UNVALID
      } else if (!required && isUndefined) {
        return r.VALID
      } else {
        return r.PASS
      }
    },
    $empty: function (target, canEmpty, r) {
      if (canEmpty && target === '') {
        return r.VALID
      } else if (!canEmpty && target === '') {
        return r.UNVALID
      } else {
        return r.PASS
      }
    },
    $null: function (target, canNull, r) {
      var isNull = _.type('Null', target)
      if (!canNull && isNull) {
        return r.UNVALID
      } else if (canNull && isNull) {
        return r.VALID
      } else {
        return r.PASS
      }
    }
  },
  format: function (preObj) {
    var _preObj = {}
    Object.keys(this._extended).forEach(function (key) {
      _preObj[key] = preObj[key] || false
    })
    return _preObj
  },
  canHandle: function () {
    return false
  },
  check: _.arg2arrWrap(function (arr, preObj) {
    var _preObj = this.format(preObj)
    var keys = Object.keys(_preObj)
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      var handler = this.get(key)
      if (!handler) return false
      handler = _.partial(handler, _, _preObj[key], this.RESULT)
      var rt = _.pand.apply(_, _.map(arr, handler))
      if (rt === this.RESULT.PASS) {
        continue
      } else {
        return rt
      }
    }
    return this.RESULT.PASS
  }),
  name: 'modifier'
})
