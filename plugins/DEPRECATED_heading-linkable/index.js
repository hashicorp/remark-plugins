const generateSlug = require('../../generate_slug')
const map = require('unist-util-map')
const is = require('unist-util-is')

module.exports = function headingLinkablePlugin({ compatibilitySlug } = {}) {
  return function transformer(tree) {
    const links = []
    return map(tree, node => {
      if (!is(node, 'heading')) return node
      const text = node.children.reduce((m, i) => {
        m += i.value
        return m
      }, '')

      const slug = generateSlug(text, links)
      node.children.unshift({
        type: 'html',
        value: `<a class="__target" id="${slug}" aria-hidden="true"></a>`
      })

      if (compatibilitySlug) {
        const slug2 = compatibilitySlug(text)
        if (slug !== slug2) {
          node.children.unshift({
            type: 'html',
            value: `<a class="__target_compat" id="${slug2}" aria-hidden="true"></a>`
          })
        }
      }

      node.children.unshift({
        type: 'html',
        value: `<a class="anchor" href="#${slug}" aria-label="${generateSlug.generateAriaLabel(
          text
        )} permalink">»</a>`
      })

      return node
    })
  }
}
