const remark = require('remark')
const html = require('remark-html')
const headingLinkable = require('./index.js')

describe('heading-linkable', () => {
  it('should produce the expected html output', () => {
    expect(
      remark()
        .use(headingLinkable)
        .use(html)
        .processSync('# hello world')
        .toString()
    ).toMatch(
      '<h1 id="hello-world"><a href="#hello-world" aria-hidden class="anchor">»</a>hello world</h1>'
    )
  })
  it('should use the github-slugger library to produce slugs/ids', () => {
    const slugger = require('github-slugger')()

    const inputHeadings = [
      'Hello world',
      'Hello World',
      'HelloWorld',
      'Helloworld',
      'helloworld',
      ':bomb:Bomber',
      ':bomb::bomb:Double Bomber',
      'Foo',
      'foo',
      'Bar',
      'bar',
      'Bar'
    ]
    const randomizeHeadingLevel = () =>
      '#'.repeat(Math.floor(Math.random() * 5) + 1)
    const contents = inputHeadings
      .map(x => `${randomizeHeadingLevel()} ${x}`)
      .join('\n')

    const processor = remark().use(headingLinkable)
    const ast = processor.runSync(processor.parse(contents))

    slugger.reset()
    const expectedSlugs = inputHeadings.map(x => slugger.slug(x))

    expect(ast.children.map(child => child.data.id)).toStrictEqual(
      expectedSlugs
    )
  })
})
