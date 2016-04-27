'use strict'
/*global describe, it */
var V = require('../lib')
require('./extend')
var expect = require('should')
var util = require('../lib/util')

describe('Api', function () {
  it('get', function () {
    var handler = V.get('String')
    expect(handler.check('as', 'String')).equal(true)
  })

  it('type', function () {
    expect(V.type('String', 'as')).equal(true)
    expect(V.type('Number', 'as')).equal(false)
  })

  it('$', function () {
    expect(V.$('in', [1, 2], 1)).equal(true)
    expect(V.$('in', [1, 2], 3)).equal(false)
    expect(V.$('type', 'Number', 3))
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
    // extend struct
    V.extend('struct', 'User', {
      a: 'Number:required',
      b: 'String'
    })
    expect(V.struct('User', {a: 1, b: 'as'})).equal(true)
    expect(V.struct('User', {b: 'as'})).equal(false)
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
    V.extendParser(function (rule, struct, ruleIns) {
      if (!(typeof rule === 'string' && rule.charAt(0) === '#')) return false
      rule = rule.slice(1)
      rule = 'is' + rule.charAt(0).toUpperCase() + rule.slice(1)
      var handler = V.get(rule)
      if (!handler) return false
      ruleIns.setHandler(handler, rule)
      struct.add(ruleIns)
      return true
    })
    var struct = V.parse({a: '#test'})
    var rt = struct.check({a: 'include'})
    expect(rt).equal(true)
  })

  it('Modifier', function () {
    V.extend('modifier', {
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
    var struct = V.parse({a: 'String:empty'})
    var rt = struct.check({a: ''})
    expect(rt).equal(true)
  })

  // it('struct', function () {
  //   V.extend('struct', {
  //     user: V.parse({
  //       name: 'Word',

//     })
//   })
// })
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
    var struct = V.parse(rule)
    expect(struct.check({a: [[1, 2, 3, 4]]})).equal(true)
    expect(struct.check({a: [[1, 2, 3, 'as']]})).equal(false)
  })

  it('struct', function () {
    var rule = {
      a: 'String:required',
      c: 'String:null'
    }
    var struct = V.parse(rule)
    expect(struct.check({}, {withErrors: true})[1][0].path).equal('a')
    expect(struct.check({a: 'a', c: null})).equal(true)
    expect(struct.check({a: null}, {withErrors: true})[1][0].path).equal('a')
    expect(struct.check({c: undefined}, {withErrors: true})[1][0].path).equal('a')
    rule = {
      a: 'String',
      b: 'Number'
    }
    struct = V.parse(rule)
    expect(struct.check({})).equal(true)
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
    var struct = V.parse(rule)
    expect(struct.check({a: 1, b: 12})).equal(true)
    expect(struct.check({a: 3, b: 1})).equal(false)
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
    var struct = V.parse(rule)
    expect(struct.check({a: 1, b: 1})).equal(true)
    expect(struct.check({a: '12', b: 0})).equal(true)
    expect(struct.check({a: 12, b: 0})).equal(false)
  })
})
