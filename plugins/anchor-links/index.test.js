const remark = require('remark')
const html = require('remark-html')
const anchorLinks = require('./index.js')

describe('anchor-links', () => {
  describe('headings', () => {
    test('basic', () => {
      expect(execute('# hello world')).toMatch(
        [
          '<h1>',
          '<a class="__permalink-h" href="#hello-world" aria-label="hello world permalink">»</a>',
          '<a class="__target-h" id="hello-world" aria-hidden="true"></a>',
          'hello world',
          '</h1>'
        ].join('')
      )
    })

    test('duplicate slugs', () => {
      expect(
        execute([
          '# hello world',
          '# hello world',
          '# foo',
          '# hello world',
          '# foo'
        ])
      ).toMatch(
        expectedHeadingResult([
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
        execute([
          '# hello world <a href="wow"></a>',
          '# hello <a href="wow"></a> world'
        ])
      ).toMatch(
        expectedHeadingResult([
          ['hello world <a href="wow"></a>', 'hello-world', 'hello world'],
          ['hello <a href="wow"></a> world', 'hello-world-1', 'hello world']
        ])
      )
    })

    test('removes leading hyphens', () => {
      expect(execute(['# - hello world', '# <a></a> hello world'])).toMatch(
        expectedHeadingResult([
          ['- hello world', 'hello-world', 'hello world'],
          ['<a></a> hello world', 'hello-world-1', 'hello world']
        ])
      )
    })

    test('removes double hyphens', () => {
      expect(
        execute([
          '# hEllO----world',
          '# hello :&-- world',
          '# hello world (foo)()'
        ])
      ).toMatch(
        expectedHeadingResult([
          ['hEllO----world', 'hello-world', 'hello world'],
          ['hello :&#x26;-- world', 'hello-world-1', 'hello world'],
          ['hello world (foo)()', 'hello-world-foo', 'hello world foo']
        ])
      )
    })

    test('generates an extra slug if the argument is provided', () => {
      expect(
        execute('# hello world', { compatibilitySlug: _ => 'foo' })
      ).toMatch(
        [
          '<h1>',
          '<a class="__permalink-h" href="#hello-world" aria-label="hello world permalink">»</a>',
          '<a class="__target-h __compat" id="foo" aria-hidden="true"></a>',
          '<a class="__target-h" id="hello-world" aria-hidden="true"></a>',
          'hello world',
          '</h1>'
        ].join('')
      )
    })

    test('does not render duplicate compatibility slugs', () => {
      expect(
        execute('# hello world', { compatibilitySlug: _ => 'hello-world' })
      ).toMatch(
        [
          '<h1>',
          '<a class="__permalink-h" href="#hello-world" aria-label="hello world permalink">»</a>',
          '<a class="__target-h" id="hello-world" aria-hidden="true"></a>',
          'hello world',
          '</h1>'
        ].join('')
      )
    })
  })

  describe('lists starting with inline code', () => {
    test('basic', () => {
      expect(
        execute([
          'some text',
          '',
          '- raw text',
          '- `code with spaces`',
          '- `code_with_text_after` - explanation of code',
          '- text `followed_by_code` then more text',
          '- <a>html</a> `followed_by_code` then more text',
          '',
          'some more text'
        ])
      ).toMatch(
        [
          '<p>some text</p>',
          '<ul>',
          '<li>raw text</li>',
          '<li><a id="code-with-spaces" class="__target-lic" aria-hidden></a><a href="#code-with-spaces" aria-label="code with spaces permalink" class="__permalink-lic"><code>code with spaces</code></a></li>',
          '<li><a id="code_with_text_after" class="__target-lic" aria-hidden></a><a href="#code_with_text_after" aria-label="code_with_text_after permalink" class="__permalink-lic"><code>code_with_text_after</code></a> - explanation of code</li>',
          '<li>text <code>followed_by_code</code> then more text</li>',
          '<li><a>html</a> <code>followed_by_code</code> then more text</li>',
          '</ul>',
          '<p>some more text</p>'
        ].join('\n')
      )
    })

    test('duplicate slugs', () => {
      expect(execute(['- `foo`', '- `foo`'])).toMatch(
        [
          '<ul>',
          '<li><a id="foo" class="__target-lic" aria-hidden></a><a href="#foo" aria-label="foo permalink" class="__permalink-lic"><code>foo</code></a></li>',
          '<li><a id="foo-1" class="__target-lic" aria-hidden></a><a href="#foo-1" aria-label="foo permalink" class="__permalink-lic"><code>foo</code></a></li>',
          '</ul>'
        ].join('\n')
      )
    })

    test('prefix option', () => {
      expect(
        execute('- `foo`', { listWithInlineCodePrefix: 'inlinecode' })
      ).toMatch(
        [
          '<ul>',
          '<li><a id="inlinecode-foo" class="__target-lic" aria-hidden></a><a href="#inlinecode-foo" aria-label="foo permalink" class="__permalink-lic"><code>foo</code></a></li>',
          '</ul>'
        ].join('\n')
      )
    })

    test('duplicate slug with headline', () => {
      expect(execute(['# foo', '', '- `foo`'])).toMatch(
        [
          '<h1><a class="__permalink-h" href="#foo" aria-label="foo permalink">»</a><a class="__target-h" id="foo" aria-hidden="true"></a>foo</h1>',
          '<ul>',
          '<li><a id="foo-1" class="__target-lic" aria-hidden></a><a href="#foo-1" aria-label="foo permalink" class="__permalink-lic"><code>foo</code></a></li>',
          '</ul>'
        ].join('\n')
      )
    })

    test('duplicate slug with headline and prefix option', () => {
      expect(
        execute(['# foo', '', '- `foo`'], {
          listWithInlineCodePrefix: 'inlinecode'
        })
      ).toMatch(
        [
          '<h1><a class="__permalink-h" href="#foo" aria-label="foo permalink">»</a><a class="__target-h" id="foo" aria-hidden="true"></a>foo</h1>',
          '<ul>',
          '<li><a id="inlinecode-foo" class="__target-lic" aria-hidden></a><a href="#inlinecode-foo" aria-label="foo permalink" class="__permalink-lic"><code>foo</code></a></li>',
          '</ul>'
        ].join('\n')
      )
    })
  })
})

function execute(input, options = {}) {
  return remark()
    .use(anchorLinks, options)
    .use(html)
    .processSync([].concat(input).join('\n'))
    .toString()
    .trim()
}

// Takes an array of expected results, [literal text, slug, aria label]
function expectedHeadingResult(results) {
  return results
    .map(([text, slug, ariaLabel]) => {
      return `<h1><a class="__permalink-h" href="#${slug}" aria-label="${ariaLabel} permalink">»</a><a class="__target-h" id="${slug}" aria-hidden="true"></a>${text}</h1>`
    })
    .join('\n')
}
