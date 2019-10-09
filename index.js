const headingLinkable = require('./plugins/heading-linkable')
const inlineCodeLinkable = require('./plugins/inline-code-linkable')
const paragraphCustomAlerts = require('./plugins/paragraph-custom-alerts')
const typography = require('./plugins/typography')
const includeMarkdown = require('./plugins/include-markdown')

// allow individual plugins to be pulled out and used
module.exports = {
  headingLinkable,
  inlineCodeLinkable,
  paragraphCustomAlerts,
  typography,
  includeMarkdown
}

// for easy use of everything at the same time
module.exports.allPlugins = [
  includeMarkdown,
  headingLinkable,
  inlineCodeLinkable,
  paragraphCustomAlerts,
  typography
]
