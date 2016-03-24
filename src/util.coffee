{ isObject, mapKeys } = _ = require('lodash')

module.exports =

  startWithDollar: (str) ->
    return false unless typeof str is 'string'
    return /^\$/.test(str)

  slice: (args, pos=0, end) ->
    arr = []
    len = args.length
    end or= len-1
    for i in [pos..end]
      arr.push args[i]
    return arr

  argsWrap: (fn) ->
    (key, val) ->
      self = @
      if isObject key
        mapKeys key, (val, key) ->
          fn.call(self, key, val)
      else
        fn.call(self, key, val)

  reduceWrap: (fn) ->
    ->
      args = u.slice(arguments)
      return _.reduce(args, fn)

  resolvePath: (path, obj) ->
    return obj unless obj and path
    if ~path.indexOf('$array')
      pis = path.split(/^\$array\.|\$array|\.\$array$/)
      rt = obj
      curriedResult = _.curryRight(_.result)(undefined)
      max = pis.length - 1
      pis.forEach (p, ind) ->
        p = p.replace(/^\.+|\.+$/g, '')
        # p为空且不以$array开头的情况
        if p is '' and ind <= max
          rt = [].concat.apply [], rt
        else
          if _.isArray rt
            rt = _.map rt, (r) ->
              curriedResult(p)(r)
            # 如果不是最后一次，则展开结果数组
            if ind < max
              rt = [].concat.apply [], rt
          else if _.isObject rt
            rt = _.result rt, p
      return rt
    else
      return _.result obj, path