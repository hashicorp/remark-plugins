const generateSlug = require('./generate_slug')

test('numbering works', () => {
  const links = []
  expect(generateSlug('foo bar', links)).toEqual('foo-bar')
  expect(generateSlug('foo bar', links)).toEqual('foo-bar-1')
  expect(generateSlug('foo bar', links)).toEqual('foo-bar-2')
})

test('strips extra whitespace', () => {
  expect(generateSlug('foo     bar')).toEqual('foo-bar')
  expect(generateSlug('   foo     bar     ')).toEqual('foo-bar')
})

test('strips extra characters and html', () => {
  expect(generateSlug('foo bar (wow)')).toEqual('foo-bar-wow')
  expect(generateSlug('foo bar--wow -')).toEqual('foo-bar-wow')
  expect(generateSlug('foo bar_wow ♥ф你-💣')).toEqual('foo-bar_wow')
  expect(generateSlug("foo bar <wow&:[]'")).toEqual('foo-bar-wow')
  expect(generateSlug('foo bar <wow>')).toEqual('foo-bar')
  expect(generateSlug('foo bar <a>wow</a>')).toEqual('foo-bar-wow')
})

test('downcases', () => {
  expect(generateSlug('fOo BAr')).toEqual('foo-bar')
})

test('generates aria label', () => {
  expect(generateSlug.generateAriaLabel('foo bar <a>wow</a>')).toEqual(
    'foo bar wow'
  )
  expect(generateSlug.generateAriaLabel('foo bar ((#wow))')).toEqual('foo bar')
})

test('removes anchor link aliases', () => {
  expect(generateSlug('foo bar ((#wow))')).toEqual('foo-bar')
})
