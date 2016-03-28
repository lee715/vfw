// Generated by CoffeeScript 1.9.1
;(function () {
  var V, Validator, _, isArray, isFunction, isObject, isString, isUndefined, ref, validator

  V = require('../js/app')

  validator = require('validator')

  ref = _ = require('lodash'), isString = ref.isString, isArray = ref.isArray, isObject = ref.isObject, isUndefined = ref.isUndefined, isFunction = ref.isFunction

  Validator = {}

  Validator.String = function (str) {
    if (str == null) {
      return null
    }
    if (!_.isString(str)) {
      return false
    }
    return str.trim()
  }

  Validator.Array = function (arr) {
    if (!arr) {
      return null
    }
    if (!_.isArray(arr)) {
      return false
    }
    return arr
  }

  Validator.StringLike = function (str) {
    return Validator.String(str) || Validator.Number(str)
  }

  Validator.ObjectID = Validator.ObjectId = function (oid) {
    if (!oid) {
      return null
    }
    oid = Validator.String('' + oid)
    if (!oid) {
      return false
    }
    if (/^[0-9a-fA-F]{24}$/.test(oid)) {
      return oid
    } else {
      return false
    }
  }

  Validator.NumberLike = function (val) {
    if (val == null) {
      return null
    }
    if (validator.isNumeric(+val)) {
      return +val
    } else {
      return false
    }
  }

  Validator.Number = function (val) {
    if (val == null) {
      return null
    }
    if (validator.isNumeric(val)) {
      return val
    } else {
      return false
    }
  }

  Validator.Money = function (val) {
    if (val == null) {
      return null
    }
    if (/^\d+\.?\d{0,2}$/.test(val)) {
      return val
    } else {
      return false
    }
  }

  Validator.URL = Validator.Url = function (val) {
    if (!val) {
      return null
    }
    if (validator.isURL(val)) {
      return val
    } else {
      return false
    }
  }

  Validator.Method = function (val) {
    var ref1
    if (!val) {
      return null
    }
    if ((ref1 = val.toLowerCase()) === 'get' || ref1 === 'put' || ref1 === 'post' || ref1 === 'del' || ref1 === 'delete') {
      return val
    } else {
      return false
    }
  }

  Validator.Boolean = function (val) {
    if (val == null) {
      return null
    }
    if (val === 'true' || val === true || val === 1 || val === '1') {
      return true
    } else if (val === 'false' || val === false || val === 0 || val === '0') {
      return true
    } else {
      return null
    }
  }

  Validator.Date = function (val) {
    var date
    if (!val) {
      return null
    }
    date = new Date(val)
    if (!!date.getTime()) {
      return date
    } else {
      return false
    }
  }

  Validator.Email = function (email) {
    if (!email) {
      return null
    }
    email = Validator.String(email)
    if (!email) {
      return false
    }
    email = email.toLowerCase()
    if (validator.isEmail(email)) {
      return email
    }
    return false
  }

  V.include('type', Validator)

  V.extend('expression', {
    $hasKeys: function (target, keys) {
      var i, key, len, res
      if (!target) {
        return null
      }
      if (!(keys && keys.length)) {
        return null
      }
      res = true
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i]
        if (_.isUndefined(target[key])) {
          res = false
          break
        }
      }
      return res && target
    },
    $object: function (target, arg) {
      var key, keyType, res, val, valType
      keyType = arg[0], valType = arg[1]
      if (!target) {
        return null
      }
      res = true
      for (key in target) {
        val = target[key]
        if (!(V.type(keyType, key) && V.type(valType, val))) {
          res = false
          break
        }
      }
      return res && target
    },
    $commaArray: function (target, type) {
      var arr, i, item, len, res
      if (!(target && _.isString(target) && type)) {
        return null
      }
      arr = target.split(',')
      res = true
      for (i = 0, len = arr.length; i < len; i++) {
        item = arr[i]
        if (!V.type(type, item)) {
          res = false
          break
        }
      }
      return res && arr
    },
    $range: function (target, range) {
      var num
      if (!target) {
        return null
      }
      num = null
      if (isNumber(target)) {
        num = target
      } else if (!isUndefined(target.length)) {
        num = target.length
      }
      if (num === null) {
        return null
      }
      return num < range[1] && num > range[0]
    }
  })

}).call(this)
