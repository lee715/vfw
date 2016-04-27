Introduction
====================
Validator Framework, write once and use anywhere.

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

## API

### vfw.type(Type, target)
```js
vfw.type('String', 'asd') // => true
vfw.type('Number', 'asd') // => false
```

### vfw.express or vfw.$
```js
vfw.$('in', [1, 2], 1) // => true
```

### vfw.struct(StructName, target)
```js
vfw.struct('User', {user: 'lee', password: '123456'})
```

### vfw.extendRule(opts)
- extend your own RuleType. type, expression, struct are all instanceof RuleType.
```js
vfw.extendRule({
  // canHandle function must be rewrited to tell vfw what it can handle
  canHandle: function (obj) {
    return /^@/.test(obj)
  },
  name: 'custom'
})
// if name supported
vfw.custom('@as', 12)
// and you can write rule like this
vfw.parse({
  a: '@string'
})
```

### vfw.extendParser(Function)
```js
// extend a new RuleType, the rule '#xxx' will be handled by isXxx
// for example, #string will be handled by isString
vfw.extendParser(function (rule, struct, ruleIns) {
  // if this function cant handle the rule, return false, and this rule will handled by others
  if (!(typeof rule === 'string' && rule.charAt(0) === '#')) return false
  rule = rule.slice(1)
  rule = 'is' + rule.charAt(0).toUpperCase() + rule.slice(1)
  var handler = vfw.get(rule)
  if (!handler) return false
  ruleIns.setHandler(handler, rule)
  struct.add(ruleIns)
  return true
})
var _ = require('lodash')
vfw.include('type', _)
// use _.isPlainObject
var struct = vfw.parse({a: '#PlainObject'})
struct.check({a: {a: 1}}) // => true
```

### vfw.extend(type, extends)
- type `String` name of RuleType, like 'type', 'expression'
- extends `Object` the functions you want to extend
```js
vfw.extend('type', {
  Money: function(){},
  Url: function(){}
})
vfw.extend('expression', {
  $lt: function(target, len){},
  $startWith: function(target, char){}
})
// once extended, those rules can be used anywhere
```

### vfw.include(type, obj)
- type `String` name of RuleType, like 'type', 'expression'
- obj `Object`
- you can include a lib like lodash, validator or others and use the functions they supported
```js
var _ = require('lodash')
vfw.include('type', _)
// use _.isPlainObject
var struct = vfw.parse({a: '#PlainObject'})
struct.check({a: {a: 1}}) // => true
```

###
