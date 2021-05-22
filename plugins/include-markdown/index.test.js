const path = require('path')
const { readSync } = require('to-vfile')
const remark = require('remark')
const includeMarkdown = require('./index.js')
const normalizeNewline = require('normalize-newline')

describe('include-markdown', () => {
  test('basic', () => {
    remark()
      .use(includeMarkdown)
      .process(loadFixture('basic'), (err, file) => {
        if (err) throw new Error(err)
        expect(file.contents).toEqual(loadFixture('basic.expected').contents)
      })
  })

  test('include mdx', () => {
    remark()
      .use(includeMarkdown)
      .process(loadFixture('mdx-format'), (err, file) => {
        if (err) throw new Error(err)
        expect(file.contents).toEqual(
          loadFixture('mdx-format.expected').contents
        )
      })
  })

  test('include custom mdx components', () => {
    // Set up a basic snippet as an mdast tree
    const sourceMdx = `hello\n\n@include 'include-with-component.mdx'\n\nworld`
    const rawTree = remark().parse(sourceMdx)
    // Set up the includes plugin which will also run remark-mdx
    const resolveFrom = path.join(__dirname, 'fixtures')
    const tree = includeMarkdown({ resolveFrom, resolveMdx: true })(rawTree)
    // Assert that the resulting tree has the structure we expect
    expect(tree.children.length).toBe(5)
    const [beforeP, includeP, includeNewline, includeComponent, afterP] =
      tree.children
    // Before and after paragraphs will be "plain" markdown ASTs
    expect(beforeP.children[0].value).toBe('hello')
    // included nodes will have been processed into MDX ASTs
    expect(includeP.type).toBe('element')
    expect(includeP.tagName).toBe('p')
    expect(includeP.children[0].value).toBe('some text in an include')
    expect(includeNewline.type).toBe('text')
    expect(includeNewline.value).toBe('\n')
    // Expect the custom component to appear in the resulting tree as JSX
    expect(includeComponent.type).toBe('jsx')
    expect(includeComponent.value).toBe('<CustomComponent />')
    // Before and after paragraphs will be "plain" markdown ASTs
    expect(afterP.children[0].value).toBe('world')
  })

  test('handles HTML comments when MDX is enabled', () => {
    // Set up a basic snippet as an mdast tree
    const sourceMdx = `<!-- HTML comment -->\n\n@include 'include-with-comment.mdx'\n\nworld`
    const rawTree = remark().parse(sourceMdx)
    // Set up the includes plugin which will also run remark-mdx
    const resolveFrom = path.join(__dirname, 'fixtures')
    const tree = includeMarkdown({ resolveFrom, resolveMdx: true })(rawTree)
    // Expect the tree to have the right number of nodes
    expect(tree.children.length).toBe(11)
    // Expect the direct comment to be an HTML node,
    // as we've only processed it with remark().
    const directComment = tree.children[0]
    expect(directComment.type).toBe('html')
    expect(directComment.value).toBe('<!-- HTML comment -->')
    // Expect the custom component in the include to be a JSX node
    const customComponent = tree.children[3]
    expect(customComponent.type).toBe('jsx')
    expect(customComponent.value).toBe('<PluginTierLabel tier="official" />')
    // Expect the comment in the include to be a comment node,
    // as it has been parsed with remark-mdx and md-ast-to-mdx-ast,
    // the latter of which transforms comments from "html" to "comment" nodes
    const includedComment = tree.children[7]
    expect(includedComment.type).toBe('comment')
    expect(includedComment.value).toBe(' HTML comment but nested ')
  })

  test('include non-markdown', () => {
    remark()
      .use(includeMarkdown)
      .process(loadFixture('non-markdown'), (err, file) => {
        if (err) throw new Error(err)
        expect(file.contents).toEqual(
          loadFixture('non-markdown.expected').contents
        )
      })
  })

  test('invalid path', () => {
    expect(() =>
      remark()
        .use(includeMarkdown)
        .process(loadFixture('invalid-path'), (err) => {
          if (err) throw err
        })
    ).toThrow(
      /The @include file path at .*bskjbfkhj was not found\.\s+Include Location: .*invalid-path\.md:3:1/gm
    )
  })

  test('resolveFrom option', () => {
    remark()
      .use(includeMarkdown, {
        resolveFrom: path.join(__dirname, 'fixtures/nested'),
      })
      .process(loadFixture('resolve-from'), (err, file) => {
        if (err) throw new Error(err)
        expect(file.contents).toEqual(
          loadFixture('resolve-from.expected').contents
        )
      })
  })
})

function loadFixture(name) {
  const vfile = readSync(path.join(__dirname, 'fixtures', `${name}.md`), 'utf8')
  vfile.contents = normalizeNewline(vfile.contents)
  return vfile
}
