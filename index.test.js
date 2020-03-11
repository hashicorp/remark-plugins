const remarkPlugins = require('./index')

it('api works as intended', () => {
  expect(remarkPlugins.anchorLinks).toBeTruthy()
  expect(remarkPlugins.paragraphCustomAlerts).toBeTruthy()
  expect(remarkPlugins.typography).toBeTruthy()
  expect(remarkPlugins.includeMarkdown).toBeTruthy()
  expect(remarkPlugins.allPlugins().length).toBe(4)
  // passes options to headingLinkable correctly
  expect(remarkPlugins.allPlugins({ anchorLinks: 'foo' })[1][1]).toBe('foo')
})
