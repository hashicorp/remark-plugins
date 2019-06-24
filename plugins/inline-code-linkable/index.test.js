const remark = require('remark')
const codeBlockLinkable = require('./index.js')

describe('inlineCode-linkable', () => {
  describe('basic fixture - two list items; one linkable', () => {
    const processor = remark().use(codeBlockLinkable)
    const ast = processor.runSync(
      processor.parse(
        '- first\n- `code` here is some code\n- should not link this `codeBlock`'
      )
    )

    const firstListItem = ast.children[0].children[0]
    const secondListItem = ast.children[0].children[1]
    const thirdListItem = ast.children[0].children[2]

    it('should add an id to an <li> that contains <code>', () => {
      expect(secondListItem.data.hProperties.id).toEqual('inlinecode-code')
    })

    it("should *not* add an id to an <li> that doesn't contain <code>", () => {
      expect(firstListItem.data).not.toBeDefined()
    })

    it('should wrap <code> elements within an <a> tag', () => {
      expect(secondListItem.children[0].children[0].type).toEqual('link')
      expect(secondListItem.children[0].children[0].children[0].type).toEqual(
        'inlineCode'
      )
    })

    it('should produce and apply matching ids and href attributes for <li> and <a>', () => {
      expect(secondListItem.data.hProperties.id).toEqual(
        secondListItem.children[0].children[0].url.slice(1)
      )
    })

    it('should *not* link <li> where <code> appears outside of first position', () => {
      expect(thirdListItem.data).not.toBeDefined()
    })
  })

  describe('intermediate fixture - several list items; several linkable', () => {
    const processor = remark().use(codeBlockLinkable)
    const ast = processor.runSync(
      processor.parse(
        '- one\n- two\n- `three` docs for **three**\n- four\n- `five` is also linkable!\n- `six` is linkable too!'
      )
    )

    const firstListItem = ast.children[0].children[0]
    const secondListItem = ast.children[0].children[1]
    const thirdListItem = ast.children[0].children[2]
    const fourthListItem = ast.children[0].children[3]
    const fifthListItem = ast.children[0].children[4]
    const sixthListItem = ast.children[0].children[5]

    it("should make third, fifth, and sixth <li>'s linkable", () => {
      expect(thirdListItem.data.hProperties.id).toBeDefined()
      expect(fifthListItem.data.hProperties.id).toBeDefined()
      expect(sixthListItem.data.hProperties.id).toBeDefined()
    })

    it("should *not* make first, second, and fourth <li>'s linkable", () => {
      expect(firstListItem.data).not.toBeDefined()
      expect(secondListItem.data).not.toBeDefined()
      expect(fourthListItem.data).not.toBeDefined()
    })
  })
})
