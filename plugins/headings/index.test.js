const mdx = require('@mdx-js/mdx')
const generateSlug = require('../../generate_slug')
const headingsPlugin = require('./index.js')

const basicContents = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
`

const anchorLinkAliasContents = `
# Heading 1 ((custom-link-alias-1))
## Heading # ((custom-link-alias-2))
`

describe('headings plugin', () => {
  it('exposes the correct data for basic headings', async () => {
    const headings = []
    await mdx(basicContents, {
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

  it('exposes the correct data for headings with custom anchor link aliases', () => {
    const headings = []
    await mdx(anchorLinkAliasContents, {
      remarkPlugins: [[headingsPlugin, { headings }]],
    })

    expect(headings).toMatchInlineSnapshot(`
    Array [
      Object {
        "level": 1,
        "slug": "custom-link-alias-1",
        "title": "Heading 1",
      },
      Object {
        "level": 2,
        "slug": "custom-link-alias-2",
        "title": "Heading 2",
      },
    ]
    `)
  })
})
