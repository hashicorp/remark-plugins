const typeStyles = require('./index.js')
const mdx = require('@mdx-js/mdx')

const fileContents = `hi there

# Heading One
## Heading Two
sadklfjhlskdjf

### Heading Three
#### Heading Four
##### Heading Five
###### Heading Six

Foo bar baz wow *amaze*

- foo
- bar
`

describe('type-styles', () => {
  it('should construct add appropriate class names to headings', () => {
    const output = mdx.sync(fileContents, { remarkPlugins: [typeStyles] })
    expect(output).toMatch(
      /<h1 {\.\.\.{\n\s+"className": "g-type-display-2"\n\s+}}>{`Heading One`}<\/h1>/
    )
    expect(output).toMatch(
      /<h6 {\.\.\.{\n\s+"className": "g-type-label"\n\s+}}>{`Heading Six`}<\/h6>/
    )
    expect(output).toMatch(
      /<li parentName="ul" {\.\.\.{\n\s+"className": "g-type-body"\n\s+}}>{`foo`}<\/li>/
    )
  })
})
