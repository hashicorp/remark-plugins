const path = require('path')
const remark = require('remark')
const flatMap = require('unist-util-flatmap')
const { readSync } = require('to-vfile')
const { createMdxAstCompiler } = require('@mdx-js/mdx')

module.exports = function includeMarkdownPlugin({
  resolveFrom,
  resolveMdx,
} = {}) {
  return function transformer(tree, file) {
    return flatMap(tree, (node) => {
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

      // if we are including a ".md" or ".mdx" file, we add the contents as processed markdown
      // if any other file type, they are embedded into a code block
      if (includePath.match(/\.md(?:x)?$/)) {
        // return the file contents in place of the @include
        // (takes a couple steps because we're processing includes)
        // if the include is MDX, and the plugin consumer has confirmed their
        // ability to stringify MDX nodes (eg "jsx"), then use createMdxAstCompiler
        // rather than plain remark(). This allows us to support custom components
        // (which would otherwise appear as likely invalid HTML nodes)
        const useMdx = includePath.match(/\.mdx$/) && resolveMdx
        const processor = useMdx
          ? createMdxAstCompiler({
              remarkPlugins: [[includeMarkdownPlugin, { resolveFrom }]],
            })
          : remark().use(includeMarkdownPlugin, { resolveFrom })
        // Process the file contents, then return them
        const ast = processor.parse(includeContents)
        return processor.runSync(ast, includeContents).children
      } else {
        // trim trailing newline
        includeContents.contents = includeContents.contents.trim()

        // return contents wrapped inside a "code" node
        return [
          {
            type: 'code',
            lang: includePath.match(/\.(\w+)$/)[1],
            value: includeContents,
          },
        ]
      }
    })
  }
}
