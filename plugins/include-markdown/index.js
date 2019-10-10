const path = require('path')
const remark = require('remark')
const flatMap = require('unist-util-flatmap')
const { readSync } = require('to-vfile')

module.exports = function includeMarkdownPlugin({ resolveFrom } = {}) {
  return function transformer(tree, file) {
    return flatMap(tree, node => {
      if (node.type !== 'paragraph') return [node]

      // detect an `@include` statement
      const includeMatch =
        node.children[0].value &&
        node.children[0].value.match(/^@include\s['"](.*)['"]$/)
      if (!includeMatch) return [node]

      // read the file contents
      const includePath = path.join(
        resolveFrom || file.dirname,
        includeMatch[1]
      )
      let includeContents
      try {
        includeContents = readSync(includePath, 'utf8')
      } catch (err) {
        throw new Error(
          `The @include file path at ${includePath} was not found.\n\nInclude Location: ${file.path}:${node.position.start.line}:${node.position.start.column}`
        )
      }

      // return the file contents in place of the @include
      // this takes a couple steps because we allow recursive includes
      const processor = remark().use(includeMarkdownPlugin, { resolveFrom })
      const ast = processor.parse(includeContents)
      return processor.runSync(ast, includeContents).children
    })
  }
}
