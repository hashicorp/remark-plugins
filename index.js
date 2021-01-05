const anchorLinks = require('./plugins/anchor-links')
const paragraphCustomAlerts = require('./plugins/paragraph-custom-alerts')
const typography = require('./plugins/typography')
const includeMarkdown = require('./plugins/include-markdown')

// allow individual plugins to be pulled out and used
module.exports = {
  anchorLinks,
  paragraphCustomAlerts,
  typography,
  includeMarkdown,
}

// for easy use of everything at the same time
module.exports.allPlugins = ({
  anchorLinks: anchorLinksOptions,
  typography: typographyOptions,
  includeMarkdown: includeMarkdownOptions,
} = {}) => [
  [includeMarkdown, includeMarkdownOptions],
  [anchorLinks, anchorLinksOptions],
  paragraphCustomAlerts,
  [typography, typographyOptions],
]
