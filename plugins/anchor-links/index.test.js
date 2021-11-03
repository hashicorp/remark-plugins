const generateSlug = require('../../generate_slug')
const remark = require('remark')
const html = require('remark-html')
const anchorLinks = require('./index.js')

console.log('--->', generateSlug.generateAriaLabel('# hello world ((#foo))'))

describe('anchor-links', () => {
  describe('headings', () => {
    test('basic', () => {
      const headings = []
      expect(execute('# hello world', { headings })).toMatch(
        [
          '<h1>',
          '<a class="__permalink-h" href="#hello-world" aria-label="hello world permalink">»</a>',
          '<a class="__target-h" id="hello-world" aria-hidden></a>',
          'hello world',
          '</h1>',
        ].join('')
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world",
          "slug": "hello-world",
          "title": "hello world",
        },
      ]
      `)
    })

    test('duplicate slugs', () => {
      const headings = []
      expect(
        execute(
          ['# hello world', '# hello world', '# foo', '# hello world', '# foo'],
          { headings }
        )
      ).toMatch(
        [
          expectedHeadingResult({
            slug: 'hello-world',
            text: 'hello world',
          }),
          expectedHeadingResult({
            slug: 'hello-world-1',
            text: 'hello world',
          }),
          expectedHeadingResult({ slug: 'foo' }),
          expectedHeadingResult({
            slug: 'hello-world-2',
            text: 'hello world',
          }),
          expectedHeadingResult({ text: 'foo', slug: 'foo-1', aria: 'foo' }),
        ].join('\n')
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world",
          "slug": "hello-world",
          "title": "hello world",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world-1",
          "slug": "hello-world-1",
          "title": "hello world",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "foo",
          "slug": "foo",
          "title": "foo",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world-2",
          "slug": "hello-world-2",
          "title": "hello world",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "foo-1",
          "slug": "foo-1",
          "title": "foo",
        },
      ]
      `)
    })

    test('strips html', () => {
      const headings = []
      expect(
        execute(
          [
            '# hello world <a href="wow"></a>',
            '# hello <a href="wow"></a> world',
          ],
          { headings }
        )
      ).toMatch(
        [
          expectedHeadingResult({
            slug: 'hello-world',
            text: 'hello world <a href="wow"></a>',
            aria: 'hello world',
          }),
          expectedHeadingResult({
            slug: 'hello-world-1',
            text: 'hello <a href="wow"></a> world',
            aria: 'hello world',
          }),
        ].join('\n')
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world",
          "slug": "hello-world",
          "title": "hello world <a href=\\"wow\\"></a>",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world-1",
          "slug": "hello-world-1",
          "title": "hello <a href=\\"wow\\"></a> world",
        },
      ]
      `)
    })

    test('removes leading hyphens', () => {
      const headings = []
      expect(
        execute(['# - hello world', '# <a></a> hello world'], { headings })
      ).toMatch(
        [
          expectedHeadingResult({
            slug: 'hello-world',
            text: '- hello world',
            aria: 'hello world',
          }),
          expectedHeadingResult({
            slug: 'hello-world-1',
            text: '<a></a> hello world',
            aria: 'hello world',
          }),
        ].join('\n')
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world",
          "slug": "hello-world",
          "title": "- hello world",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world-1",
          "slug": "hello-world-1",
          "title": "<a></a> hello world",
        },
      ]
      `)
    })

    test('removes double hyphens', () => {
      const headings = []
      expect(
        execute(
          ['# hEllO----world', '# hello :&-- world', '# hello world (foo)()'],
          { headings }
        )
      ).toMatch(
        [
          expectedHeadingResult({
            slug: 'hello-world',
            text: 'hEllO----world',
            aria: 'hello world',
          }),
          expectedHeadingResult({
            slug: 'hello-world-1',
            text: 'hello :&#x26;-- world',
            aria: 'hello world',
          }),
          expectedHeadingResult({
            slug: 'hello-world-foo',
            text: 'hello world (foo)()',
            aria: 'hello world foo',
          }),
        ].join('\n')
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world",
          "slug": "hello-world",
          "title": "hEllO----world",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world-1",
          "slug": "hello-world-1",
          "title": "hello :&-- world",
        },
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world-foo",
          "slug": "hello-world-foo",
          "title": "hello world (foo)()",
        },
      ]
      `)
    })

    test('generates an extra slug if the compatibilitySlug argument is provided', () => {
      const headings = []
      expect(
        execute('# hello world', { compatibilitySlug: (_) => 'foo', headings })
      ).toMatch(
        expectedHeadingResult({
          slug: 'hello-world',
          text: 'hello world',
          compatSlugs: ['foo'],
        })
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "foo",
          "slug": "hello-world",
          "title": "hello world",
        },
      ]
      `)
    })

    test('does not render duplicate compatibility slugs', () => {
      const headings = []
      expect(
        execute('# hello world', {
          compatibilitySlug: (_) => 'hello-world',
          headings,
        })
      ).toMatch(
        expectedHeadingResult({
          slug: 'hello-world',
          text: 'hello world',
        })
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": undefined,
          "level": 1,
          "permalinkSlug": "hello-world",
          "slug": "hello-world",
          "title": "hello world",
        },
      ]
      `)
    })

    test('anchor aliases', () => {
      let headings = []
      expect(execute('# hello world ((#foo))', { headings })).toMatch(
        expectedHeadingResult({
          slug: 'hello-world',
          text: 'hello world',
          compatSlugs: ['foo'],
        })
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": Array [
            "foo",
          ],
          "level": 1,
          "permalinkSlug": "foo",
          "slug": "hello-world",
          "title": "hello world",
        },
      ]
      `)

      headings = []
      expect(execute('# hello world ((#\\_foo))', { headings })).toMatch(
        expectedHeadingResult({
          slug: 'hello-world',
          text: 'hello world',
          compatSlugs: ['_foo'],
        })
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": Array [
            "_foo",
          ],
          "level": 1,
          "permalinkSlug": "_foo",
          "slug": "hello-world",
          "title": "hello world",
        },
      ]
      `)

      headings = []
      expect(execute('# hello world ((#foo, #bar))', { headings })).toMatch(
        expectedHeadingResult({
          slug: 'hello-world',
          text: 'hello world',
          compatSlugs: ['foo', 'bar'],
        })
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": Array [
            "foo",
            "bar",
          ],
          "level": 1,
          "permalinkSlug": "foo",
          "slug": "hello-world",
          "title": "hello world",
        },
      ]
      `)

      // this *shouldn't* work but currently does, so it has coverage
      headings = []
      expect(execute('# hello world ((#foo)) more text', { headings })).toMatch(
        expectedHeadingResult({
          slug: 'hello-world-more-text',
          text: 'hello world more text',
          compatSlugs: ['foo'],
        })
      )
      expect(headings).toMatchInlineSnapshot(`
      Array [
        Object {
          "aliases": Array [
            "foo",
          ],
          "level": 1,
          "permalinkSlug": "foo",
          "slug": "hello-world-more-text",
          "title": "hello world more text",
        },
      ]
      `)
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
          '- `code_with_text_and_link` - heres [a link](#foo) and some more text',
          '',
          'some more text',
        ])
      ).toMatch(
        [
          '<p>some text</p>',
          '<ul>',
          '<li>raw text</li>',
          expectedInlineCodeResult({
            slug: 'code-with-spaces',
            code: 'code with spaces',
          }),
          expectedInlineCodeResult({
            slug: 'code_with_text_after',
            afterCode: ' - explanation of code',
          }),
          '<li>text <code>followed_by_code</code> then more text</li>',
          '<li><a>html</a> <code>followed_by_code</code> then more text</li>',
          expectedInlineCodeResult({
            slug: 'code_with_text_and_link',
            afterCode: ' - heres <a href="#foo">a link</a> and some more text',
          }),
          '</ul>',
          '<p>some more text</p>',
        ].join('\n')
      )
    })

    test('duplicate slugs', () => {
      expect(execute(['- `foo`', '- `foo`'])).toMatch(
        [
          '<ul>',
          expectedInlineCodeResult({ slug: 'foo' }),
          expectedInlineCodeResult({ slug: 'foo-1', code: 'foo' }),
          '</ul>',
        ].join('\n')
      )
    })

    test('prefix option', () => {
      expect(
        execute('- `foo`', { listWithInlineCodePrefix: 'inlinecode' })
      ).toMatch(
        [
          '<ul>',
          expectedInlineCodeResult({
            slug: 'inlinecode-foo',
            code: 'foo',
          }),
          '</ul>',
        ].join('\n')
      )
    })

    test('generates an extra slug if the compatibilitySlug argument is provided', () => {
      expect(
        execute('- `hello world`', { compatibilitySlug: (_) => 'foo' })
      ).toMatch(
        '<ul>',
        expectedInlineCodeResult({
          slug: 'hello-world',
          text: 'hello world',
          compatSlugs: ['foo'],
        }),
        '</ul>'
      )
    })

    test('does not render duplicate compatibility slugs', () => {
      expect(
        execute('- `hello world`', { compatibilitySlug: (_) => 'hello-world' })
      ).toMatch(
        '<ul>',
        expectedInlineCodeResult({
          slug: 'hello-world',
          text: 'hello world',
        }),
        '</ul>'
      )
    })

    test('duplicate slug with headline', () => {
      expect(execute(['# foo', '', '- `foo`'])).toMatch(
        [
          expectedHeadingResult({ slug: 'foo' }),
          '<ul>',
          expectedInlineCodeResult({ slug: 'foo-1', code: 'foo' }),
          '</ul>',
        ].join('\n')
      )
    })

    test('duplicate slug with headline and prefix option', () => {
      expect(
        execute(['# foo', '', '- `foo`'], {
          listWithInlineCodePrefix: 'inlinecode',
        })
      ).toMatch(
        [
          expectedHeadingResult({ slug: 'foo' }),
          '<ul>',
          expectedInlineCodeResult({
            slug: 'inlinecode-foo',
            code: 'foo',
          }),
          '</ul>',
        ].join('\n')
      )
    })

    test('anchor aliases', () => {
      expect(
        execute([
          '- `foo` ((#bar)) - other text',
          '- `foo` ((#baz, #quux))',
          '- `foo` some text ((#wow)) more text', // this one *shouldn't* work but it does currently
        ])
      ).toMatch(
        [
          '<ul>',
          expectedInlineCodeResult({
            slug: 'foo',
            compatSlugs: ['bar'],
            afterCode: ' - other text',
          }),
          expectedInlineCodeResult({
            slug: 'foo-1',
            code: 'foo',
            compatSlugs: ['baz', 'quux'],
          }),
          expectedInlineCodeResult({
            slug: 'foo-2',
            code: 'foo',
            compatSlugs: ['wow'],
            afterCode: ' some text more text',
          }),
          '</ul>',
        ].join('\n')
      )
    })

    expect(
      execute([
        '- `baz` ((#\\_bar)) text',
        '- `quux` ((#foo wow',
        '- `foo` ((#\\_wow)) text [link](#test) more',
      ])
    ).toMatch(
      [
        '<ul>',
        expectedInlineCodeResult({
          slug: 'baz',
          compatSlugs: ['_bar'],
          afterCode: ' text',
        }),
        expectedInlineCodeResult({
          slug: 'quux',
          afterCode: ' ((#foo wow',
        }),
        expectedInlineCodeResult({
          slug: 'foo',
          compatSlugs: ['_wow'],
          afterCode: ' text <a href="#test">link</a> more',
        }),
        '</ul>',
      ].join('\n')
    )
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

function expectedHeadingResult({ slug, compatSlugs, aria, text, level }) {
  const res = [`<h${level || '1'}>`]
  res.push(
    `<a class="__permalink-h" href="#${
      compatSlugs && compatSlugs.length ? compatSlugs[0] : slug
    }" aria-label="${aria || text || slug} permalink">»</a>`
  )

  if (compatSlugs) {
    compatSlugs.map((compatSlug) =>
      res.push(
        `<a class="__target-h __compat" id="${compatSlug}" aria-hidden></a>`
      )
    )
  }
  res.push(`<a class="__target-h" id="${slug}" aria-hidden></a>`)
  res.push(text || slug)
  res.push(`</h${level || '1'}>`)
  return res.join('')
}

function expectedInlineCodeResult({
  slug,
  compatSlugs,
  aria,
  code,
  afterCode,
}) {
  const res = ['<li>']

  res.push(`<a id="${slug}" class="__target-lic" aria-hidden></a>`)
  if (compatSlugs) {
    compatSlugs.map((compatSlug) =>
      res.push(
        `<a class="__target-lic __compat" id="${compatSlug}" aria-hidden></a>`
      )
    )
  }
  res.push(
    `<a href="#${
      compatSlugs && compatSlugs.length ? compatSlugs[0] : slug
    }" aria-label="${aria || code || slug} permalink" class="__permalink-lic">`
  )
  res.push(`<code>${code || slug}</code>`)
  res.push('</a>')
  afterCode && res.push(afterCode)
  res.push('</li>')

  return res.join('')
}
