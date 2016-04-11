'use strict'
/*global describe, it */
var V = require('../js/app')
require('./extend')
var expect = require('should')
var util = require('../js/util')

describe('Api', function () {
  it('get', function () {
    var handler = V.get('String')
    expect(handler.check('as', 'String')).equal(true)
  })

  it('type', function () {
    expect(V.type('String', 'as')).equal(true)
    expect(V.type('Number', 'as')).equal(false)
  })

  it('expression', function () {
    expect(V.expression({$in: [1, 2]}, 1)).equal(true)
    expect(V.expression({$in: [1, 2]}, 3)).equal(false)
  })

  it('extend', function () {
    // extend type
    V.extend('type', 'Test', function (target) {
      return target === 'test'
    })
    V.extend('type', {
      Test1: function (tar) {
        return tar === 'test1'
      }
    })
    expect(V.type('Test', 'test')).equal(true)
    expect(V.type('Test1', 12)).equal(false)
    // extend expression
    V.extend('expression', '$startWith', function (tar, arg) {
      return tar.indexOf(arg) === 0
    })
    expect(V.expression({$startWith: 'test'}, 'test1')).equal(true)
    expect(V.expression({$startWith: 'test'}, '1test')).equal(false)
  })

  it('include', function () {
    // include type
    V.include('type', {
      Test: function (target) {
        return target === 'include'
      },
      isTest: function (target) {
        return target === 'include'
      }
    })
    expect(V.type('Test', 'include')).equal(false)
    expect(V.type('isTest', 'include')).equal(true)
  })

  it('extendParser', function () {
    V.extendParser(function (rule, ruleSet, ruleIns) {
      if (!(typeof rule === 'string' && rule.charAt(0) === '#')) return false
      rule = rule.slice(1)
      rule = 'is' + rule.charAt(0).toUpperCase() + rule.slice(1)
      var handler = V.get(rule)
      if (!handler) return false
      ruleIns.setHandler(handler, rule)
      ruleSet.add(ruleIns)
      return true
    })
    var ruleSet = V.parse({a: '#test'})
    var rt = ruleSet.check({a: 'include'})
    expect(rt[0]).equal(true)
  })

  it('extendAddition', function () {
    V.extendAddition({
      $empty: function (target, canEmpty, r) {
        if (canEmpty && target === '') {
          return r.VALID
        } else if (!canEmpty && target === '') {
          return r.UNVALID
        } else {
          return r.PASS
        }
      }
    })
    var ruleSet = V.parse({a: 'String:empty'})
    var rt = ruleSet.check({a: ''})
    expect(rt[0]).equal(true)
  })
})

describe('Util', function () {
  it('resolvePath', function () {
    var obj = {
      a: [
        [
          [{b: [
              [1, 2]
          ]}]
        ]
      ]
    }
    var path = 'a.$array.$array.$array.b.$array.$array'
    expect(util.resolvePath(path, obj)[0]).equal(1)
  })
})

describe('Rule', function () {
  it('$array', function () {
    var rule = {
      a: {
        $array: {
          $array: 'Number'
        }
      }
    }
    var ruleSet = V.parse(rule)
    expect(ruleSet.check({a: [[1, 2, 3, 4]]})[0]).equal(true)
    expect(ruleSet.check({a: [[1, 2, 3, 'as']]})[0]).equal(false)
  })

  it('addition', function () {
    var rule = {
      a: 'String:required',
      c: 'String:null'
    }
    var ruleSet = V.parse(rule)
    expect(ruleSet.check({})[1][0].path).equal('a')
    expect(ruleSet.check({a: 'a', c: null})[0]).equal(true)
    expect(ruleSet.check({a: null})[1][0].path).equal('a')
    expect(ruleSet.check({c: undefined})[1][0].path).equal('a')
    rule = {
      a: 'String',
      b: 'Number'
    }
    ruleSet = V.parse(rule)
    expect(ruleSet.check({})[0]).equal(true)
  })

  it('expression', function () {
    var rule = {
      a: {
        $in: [1, 2],
        $eq: 1
      },
      b: {
        $eq: 12
      }
    }
    var ruleSet = V.parse(rule)
    expect(ruleSet.check({a: 1, b: 12})[0]).equal(true)
    expect(ruleSet.check({a: 3, b: 1})[0]).equal(false)
  })

  it('logic', function () {
    var rule = {
      $or: {
        a: 'String:required',
        b: {
          $in: [1, 2]
        }
      }
    }
    var ruleSet = V.parse(rule)
    expect(ruleSet.check({a: 1, b: 1})[0]).equal(true)
    expect(ruleSet.check({a: '12', b: 0})[0]).equal(true)
    expect(ruleSet.check({a: 12, b: 0})[0]).equal(false)
  })
})
