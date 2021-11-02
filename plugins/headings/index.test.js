const mdx = require('@mdx-js/mdx')
const generateSlug = require('../../generate_slug')
const headingsPlugin = require('./index.js')

const contents = `# Heading 1
## Heading 2
`

const startTestString =
  '/* start of @hashicorp/remark-plugins/headings-plugin comment'
const endTestString =
  'end of @hashicorp/remark-plugins/headings-plugin comment */'

describe('headings plugin', () => {
  it('includes a comment with the correct heading data', () => {
    mdx(contents, { remarkPlugins: [headingsPlugin] }).then((stuff) => {
      const indexOfCommentStart = stuff.indexOf(startTestString)
      const indexOfCommentEnd = stuff.indexOf(endTestString)
      const commentContent = stuff.substring(
        indexOfCommentStart + startTestString.length,
        indexOfCommentEnd
      )
      const headingData = JSON.parse(commentContent)

      expect(headingData).toHaveLength(2)
      expect(headingData[0].title).toBe('Heading 1')
      expect(headingData[0].slug).toBe(generateSlug('Heading 1'))
      expect(headingData[1].title).toBe('Heading 2')
      expect(headingData[1].slug).toBe(generateSlug('Heading 2'))
    })
  })
})
