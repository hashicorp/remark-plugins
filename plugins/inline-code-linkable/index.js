const is = require('unist-util-is')
const visit = require('unist-util-visit')
const slug = require('github-slugger')

const slugger = slug()

module.exports = function inlineCodeLinkablePlugin() {
  return function transformer(tree) {
    visit(tree, 'listItem', liNode => {
      visit(liNode, 'paragraph', pNode => {
        // Perform node reconstruction when code appears in first position
        if (is(pNode.children[0], 'inlineCode')) {
          const codeNode = pNode.children[0]
          // Construct an id/slug based on value of <code> node
          const codeSlug = slugger.slug(`inlinecode-${codeNode.value}`)

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
        }
      })
    })
  }
}
