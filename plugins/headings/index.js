const visit = require('unist-util-visit')
const generateSlug = require('../../generate_slug')

const COMMENT_PREFIX =
  'start of @hashicorp/remark-plugins/headings-plugin comment'
const COMMENT_SUFFIX =
  'end of @hashicorp/remark-plugins/headings-plugin comment'

module.exports = function headingsPlugin({ headings }) {
  return function transformer(tree) {
    visit(tree, 'heading', (node) => {
      const title = node.children[0].value
      const slug = generateSlug(title)
      headings.push({ title, slug, level: node.depth })
    })

    // tree.children.push({
    //   type: 'comment',
    //   value: ` ${COMMENT_PREFIX}\n${JSON.stringify(
    //     headings
    //   )}\n${COMMENT_SUFFIX} `,
    // })
  }
}
