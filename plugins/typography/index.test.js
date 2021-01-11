const typographyPlugin = require('./index.js')
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
  it('adds classNames to headings, paragraphs, and list items', () => {
    const output = mdx.sync(fileContents, { remarkPlugins: [typographyPlugin] })
    expect(output).toMatch(
      /<h1 {\.\.\.{\n\s+"className": "g-type-display-2"\n\s+}}>{`Heading One`}<\/h1>/
    )
    expect(output).toMatch(
      /<h2 {\.\.\.{\n\s+"className": "g-type-display-3"\n\s+}}>{`Heading Two`}<\/h2>/
    )
    expect(output).toMatch(
      /<h3 {\.\.\.{\n\s+"className": "g-type-display-4"\n\s+}}>{`Heading Three`}<\/h3>/
    )
    expect(output).toMatch(
      /<h4 {\.\.\.{\n\s+"className": "g-type-display-5"\n\s+}}>{`Heading Four`}<\/h4>/
    )
    expect(output).toMatch(
      /<h5 {\.\.\.{\n\s+"className": "g-type-display-6"\n\s+}}>{`Heading Five`}<\/h5>/
    )
    expect(output).toMatch(
      /<h6 {\.\.\.{\n\s+"className": "g-type-label"\n\s+}}>{`Heading Six`}<\/h6>/
    )
    expect(output).toMatch(
      /<p {\.\.\.{\n\s+"className": "g-type-long-body"\n\s+}}>{`sadklfjhlskdjf`}<\/p>/
    )
    expect(output).toMatch(
      /<li parentName="ul" {\.\.\.{\n\s+"className": "g-type-long-body"\n\s+}}>{`foo`}<\/li>/
    )
  })

  it('allows empty strings in map to prevent the addition of classNames', () => {
    const options = {
      map: {
        p: '',
      },
    }
    const output = mdx.sync(fileContents, {
      remarkPlugins: [[typographyPlugin, options]],
    })
    console.log(output)
    expect(output).not.toMatch(
      /<p {\.\.\.{\n\s+"className": "g-type-long-body"\n\s+}}>{`sadklfjhlskdjf`}<\/p>/
    )
  })

  it('allows customization of classNames', () => {
    const options = {
      map: {
        h1: 'custom-1',
        h2: 'custom-2',
        h3: 'custom-3',
        h4: 'custom-4',
        h5: 'custom-5',
        h6: 'custom-6',
        p: 'custom-paragraph',
        li: 'custom-list-item',
      },
    }
    const output = mdx.sync(fileContents, {
      remarkPlugins: [[typographyPlugin, options]],
    })
    expect(output).toMatch(
      /<h1 {\.\.\.{\n\s+"className": "custom-1"\n\s+}}>{`Heading One`}<\/h1>/
    )
    expect(output).toMatch(
      /<h2 {\.\.\.{\n\s+"className": "custom-2"\n\s+}}>{`Heading Two`}<\/h2>/
    )
    expect(output).toMatch(
      /<h3 {\.\.\.{\n\s+"className": "custom-3"\n\s+}}>{`Heading Three`}<\/h3>/
    )
    expect(output).toMatch(
      /<h4 {\.\.\.{\n\s+"className": "custom-4"\n\s+}}>{`Heading Four`}<\/h4>/
    )
    expect(output).toMatch(
      /<h5 {\.\.\.{\n\s+"className": "custom-5"\n\s+}}>{`Heading Five`}<\/h5>/
    )
    expect(output).toMatch(
      /<h6 {\.\.\.{\n\s+"className": "custom-6"\n\s+}}>{`Heading Six`}<\/h6>/
    )
    expect(output).toMatch(
      /<p {\.\.\.{\n\s+"className": "custom-paragraph"\n\s+}}>{`sadklfjhlskdjf`}<\/p>/
    )
    expect(output).toMatch(
      /<li parentName="ul" {\.\.\.{\n\s+"className": "custom-list-item"\n\s+}}>{`foo`}<\/li>/
    )
  })
})
