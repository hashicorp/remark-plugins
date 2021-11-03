const mdx = require('@mdx-js/mdx')
const generateSlug = require('../../generate_slug')
const headingsPlugin = require('./index.js')

const contents = `# Heading 1
## Heading 2
`

describe('headings plugin', () => {
  it('extracts headings into argument', async () => {
    const headings = []
    await mdx(contents, { remarkPlugins: [[headingsPlugin, { headings }]] })

    expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 1,
          "slug": "heading-1",
          "title": "Heading 1",
        },
        Object {
          "level": 2,
          "slug": "heading-2",
          "title": "Heading 2",
        },
      ]
    `)
  })
})
