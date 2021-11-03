const mdx = require('@mdx-js/mdx')
const generateSlug = require('../../generate_slug')
const headingsPlugin = require('./index.js')

const contents = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
`

describe('headings plugin', () => {
  it('includes a comment with the correct heading data', async () => {
    const headings = []
    await mdx(contents, {
      remarkPlugins: [[headingsPlugin, { headings }]],
    })

    expect(headings).toMatchInlineSnapshot(`
    Array [
      Object {
        "level": 1,
        "slug": "${generateSlug('Heading 1')}",
        "title": "Heading 1",
      },
      Object {
        "level": 2,
        "slug": "${generateSlug('Heading 2')}",
        "title": "Heading 2",
      },
      Object {
        "level": 3,
        "slug": "${generateSlug('Heading 3')}",
        "title": "Heading 3",
      },
      Object {
        "level": 4,
        "slug": "${generateSlug('Heading 4')}",
        "title": "Heading 4",
      },
      Object {
        "level": 5,
        "slug": "${generateSlug('Heading 5')}",
        "title": "Heading 5",
      },
      Object {
        "level": 6,
        "slug": "${generateSlug('Heading 6')}",
        "title": "Heading 6",
      },
    ]
    `)
  })
})
