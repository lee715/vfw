Introduction
====================
Validator Framework

Install
-------------------
```bash
$ npm install vfw
```

## Demo
```js
var vfw = require('vfw')

// check object
var ruleSet = vfw.parse({
  a: 'String:required',
  b: 'Money'
})
ruleSet.check({a: 'as', b: 99}) // => true
ruleSet.check({a: 12, b: 'x.x'}) // => false

// check array
ruleSet = vfw.parse(['String', 'Moeny'])
ruleSet.check(['as',99]) // => true
ruleSet.check([123, 'x.x']) // => false

// check multidimensional array
ruleSet = vfw.parse({
  $array: {
    $array: 'String'
  }
})
ruleSet.check([['as'], ['ds']]) // => true

// your can parse and check any js object
ruleSet = vfw.parse({
  a: {
    b: 'String'
    c: ['Method', 'Url']
  }
})
ruleSet.check({a: {b: 'as', c: ['get', 'http://github.com']}})

// with logic element, $and ,$or and $xor is supported, and your can extend more
ruleSet = vfw.parse({
  $or: {
    a: 'String',
    b: 'Moeny'
  }
})
ruleSet.check({a: 'as'}) // => true
ruleSet.check({a: 23, b: 12.2}) // => true

// with expression
ruleSet = vfw.parse({
  a: {
    $eq: 1
  }
})
ruleSet.check({a: 1}) // => 1

// use without parse api
vfw.type('String', 'as') // => true
var a = 1
vfw.expression('eq', a, 1) // => true
// $ is short for expression
vfw.$('eq', a, 1) // => true

// everything in vfw is extendable

// extend your own type
vfw.extend('type', {
  Word: function (str) {
    return /^\w+$/.test(str)
  }
})
vfw.type('Word', 'azAZ_09') // => true
ruleSet = vfw.parse({a: 'Word'})
ruleSet.check({a: 'azAZ_09'}) // => true

// extend your own expression
vfw.extend('expression', {
  $gt: function (str, len) {
    return str && str.length > len
  }
})
var b = [1, 2]
vfw.$('gt', b, 1) // => true
ruleSet = vfw.parse({a: {$gt: 2}})
ruleSet.check({a: 'aas'}) // => true

// extend your own struct
vfw.extend('struct', 'User', {
  name: 'Word:required',
  // 类型 Word 长度 小于等于6
  password: {
    $type: 'Word',
    $lte: 6
  }
})
vfw.struct('User', {name: 'asd_123', password: 'asd_as'}) // => true
vfw.struct('User', {name: 'asd_123', password: 'asd_as123'}) // => false
vfw.struct('User', {password: 'ass123'}) // => false

```
