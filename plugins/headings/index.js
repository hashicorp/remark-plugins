const visit = require('unist-util-visit')
const generateSlug = require('../../generate_slug')

module.exports = function headingsPlugin({ headings }) {
  return function transformer(tree) {
    visit(tree, 'heading', (node) => {
      const title = node.children[0].value
      const slug = generateSlug(title)
      const level = node.depth
      headings.push({ level, slug, title })
    })
  }
}
