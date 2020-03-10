const remarkPlugins = require('./index')

it('api works as intended', () => {
  expect(remarkPlugins.headingLinkable).toBeTruthy()
  expect(remarkPlugins.inlineCodeLinkable).toBeTruthy()
  expect(remarkPlugins.paragraphCustomAlerts).toBeTruthy()
  expect(remarkPlugins.typography).toBeTruthy()
  expect(remarkPlugins.includeMarkdown).toBeTruthy()
  expect(remarkPlugins.allPlugins().length).toBe(5)
  // passes options to headingLinkable correctly
  expect(remarkPlugins.allPlugins({ headingLinkable: 'foo' })[1][1]).toBe('foo')
})
