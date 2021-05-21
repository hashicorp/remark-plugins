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
    const tree = includeMarkdown({ resolveFrom, mdxPartials: true })(rawTree)
    // Expect the custom component to appear in the resulting tree as JSX
    expect(tree.children.length).toBe(4)
    const [beforeP, includedText, includedComponent, afterP] = tree.children
    expect(beforeP.children[0].value).toBe('hello')
    expect(includedText.children[0].value).toBe('some text in an include')
    expect(includedComponent.type).toBe('jsx')
    expect(includedComponent.value).toBe('<CustomComponent />')
    expect(afterP.children[0].value).toBe('world')
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
