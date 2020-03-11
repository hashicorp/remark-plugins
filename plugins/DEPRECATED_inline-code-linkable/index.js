const is = require('unist-util-is')
const map = require('unist-util-map')
const generateSlug = require('../../generate_slug')

module.exports = function inlineCodeLinkablePlugin() {
  return function transformer(tree) {
    const links = []
    map(tree, node => {
      // we're looking for: listItem -> paragraph -> [inlineCode, text]
      const liNode = node
      if (!is(liNode, 'listItem') || !liNode.children) return node
      const pNode = liNode.children[0]
      if (!is(pNode, 'paragraph') || !pNode.children) return node
      const codeNode = pNode.children[0]
      if (!is(codeNode, 'inlineCode')) return node

      // If the above all passes, we have a list item starting with inline code
      // Construct an id/slug based on value of <code> node
      const codeSlug = generateSlug(`inlinecode-${codeNode.value}`, links)

      // Add slug to parent <li> node's id attribute
      const data = liNode.data || (liNode.data = {})
      const props = data.hProperties || (data.hProperties = {})
      props.id = codeSlug

      // Wrap link element around child <code> node
      pNode.children[0] = {
        type: 'link',
        url: `#${codeSlug}`,
        title: null,
        children: [pNode.children[0]]
      }

      return node
    })
  }
}
