const remark = require('remark')
const html = require('remark-html')
const headingLinkable = require('./index.js')

describe('heading-linkable', () => {
  test('produces the expected html output', () => {
    expect(
      remark()
        .use(headingLinkable)
        .use(html)
        .processSync('# hello world')
        .toString()
    ).toMatch(
      '<h1><a class="anchor" href="#hello-world" aria-label="hello world permalink">»</a><a class="__target" id="hello-world" aria-hidden="true"></a>hello world</h1>'
    )
  })

  test('handles duplicate slugs', () => {
    expect(
      remark()
        .use(headingLinkable)
        .use(html)
        .processSync(
          [
            '# hello world',
            '# hello world',
            '# foo',
            '# hello world',
            '# foo'
          ].join('\n')
        )
        .toString()
    ).toMatch(
      expectedResult([
        ['hello world', 'hello-world', 'hello world'],
        ['hello world', 'hello-world-1', 'hello world'],
        ['foo', 'foo', 'foo'],
        ['hello world', 'hello-world-2', 'hello world'],
        ['foo', 'foo-1', 'foo']
      ])
    )
  })

  test('strips html', () => {
    expect(
      remark()
        .use(headingLinkable)
        .use(html)
        .processSync(
          [
            '# hello world <a href="wow"></a>',
            '# hello <a href="wow"></a> world'
          ].join('\n')
        )
        .toString()
    ).toMatch(
      expectedResult([
        ['hello world <a href="wow"></a>', 'hello-world', 'hello world'],
        ['hello <a href="wow"></a> world', 'hello-world-1', 'hello world']
      ])
    )
  })

  test('removes leading hyphens', () => {
    expect(
      remark()
        .use(headingLinkable)
        .use(html)
        .processSync(['# - hello world', '# <a></a> hello world'].join('\n'))
        .toString()
    ).toMatch(
      expectedResult([
        ['- hello world', 'hello-world', 'hello world'],
        ['<a></a> hello world', 'hello-world-1', 'hello world']
      ])
    )
  })

  test('removes double hyphens', () => {
    expect(
      remark()
        .use(headingLinkable)
        .use(html)
        .processSync(
          [
            '# hEllO----world',
            '# hello :&-- world',
            '# hello world (foo)()'
          ].join('\n')
        )
        .toString()
    ).toMatch(
      expectedResult([
        ['hEllO----world', 'hello-world', 'hello world'],
        ['hello :&#x26;-- world', 'hello-world-1', 'hello world'],
        ['hello world (foo)()', 'hello-world-foo', 'hello world foo']
      ])
    )
  })
})

// Takes an array of expected results, [literal text, slug, aria label]
function expectedResult(results) {
  return results
    .map(([text, slug, ariaLabel]) => {
      return `<h1><a class="anchor" href="#${slug}" aria-label="${ariaLabel} permalink">»</a><a class="__target" id="${slug}" aria-hidden="true"></a>${text}</h1>`
    })
    .join('\n')
}
