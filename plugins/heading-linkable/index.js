const generateSlug = require('../../generate_slug')
const flatMap = require('unist-util-flatmap')

module.exports = function headingLinkablePlugin() {
  return function transformer(tree) {
    const links = []
    return flatMap(tree, node => {
      if (node.type !== 'heading') return [node]
      const text = node.children.reduce((m, i) => {
        m += i.value
        return m
      }, '')
      const slug = generateSlug(text, links)
      node.children.unshift({
        type: 'html',
        value: `<a class="__target" id="${slug}" aria-hidden="true"></a>`
      })
      node.children.unshift({
        type: 'html',
        value: `<a class="anchor" href="#${slug}" aria-label="${generateAriaLabel(
          text
        )} permalink">»</a>`
      })
      return [node]
    })
  }
}

function generateAriaLabel(headline) {
  return headline
    .toLowerCase()
    .replace(/<\/?[^>]*>/g, '') // Strip links
    .replace(/^\-/g, '') // Remove leading '-'
    .replace(/\-$/g, '') // Remove trailing '-'
    .replace(/\W+/g, ' ') // Collapse whitespace
    .trim()
}

module.exports.generateAriaLabel = generateAriaLabel
