const headingLinkable = require('./plugins/heading-linkable')
const inlineCodeLinkable = require('./plugins/inline-code-linkable')
const paragraphCustomAlerts = require('./plugins/paragraph-custom-alerts')
const typography = require('./plugins/typography')

// allow individual plugins to be pulled out and used
module.exports = {
  headingLinkable,
  inlineCodeLinkable,
  paragraphCustomAlerts,
  typography
}

// for easy use of everything at the same time
module.exports.allPlugins = [
  headingLinkable,
  inlineCodeLinkable,
  paragraphCustomAlerts,
  typography
]
