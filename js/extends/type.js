'use strict'
var RuleType = require('../classes/ruletype')
var types = require('../types')

module.exports = new RuleType({
  _extended: types,
  canHandle: function (rule) {
    return this.check(rule, 'Word')
  },
  name: 'type'
})
