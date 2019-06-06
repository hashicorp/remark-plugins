const remarkPlugins = require('./index')

it('api works as intended', () => {
  expect(remarkPlugins.headingLinkable).toBeTruthy()
  expect(remarkPlugins.inlineCodeLinkable).toBeTruthy()
  expect(remarkPlugins.paragraphCustomAlerts).toBeTruthy()
  expect(remarkPlugins.typography).toBeTruthy()
  expect(remarkPlugins.allPlugins.length).toBe(4)
})
