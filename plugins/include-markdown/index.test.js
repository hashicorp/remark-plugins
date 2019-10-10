const path = require('path')
const { readSync } = require('to-vfile')
const remark = require('remark')
const flatMap = require('unist-util-flatmap')
const includeMarkdown = require('./index.js')

describe('include-markdown', () => {
  test('basic', () => {
    remark()
      .use(includeMarkdown)
      .process(loadFixture('basic'), (err, file) => {
        if (err) throw new Error(err)
        expect(file.contents).toBe(loadFixture('basic.expected').contents)
      })
  })

  test('invalid path', () => {
    expect(() =>
      remark()
        .use(includeMarkdown)
        .process(loadFixture('invalid-path'), (err, file) => {
          if (err) throw err
        })
    ).toThrow(
      /The @include file path at .*fixtures\/bskjbfkhj was not found.\n\nInclude Location: .*fixtures\/invalid-path\.md:3:1/gm
    )
  })
})

function loadFixture(name) {
  return readSync(path.join(__dirname, 'fixtures', `${name}.md`), 'utf8')
}
