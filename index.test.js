/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const remarkPlugins = require('./index')

it('api works as intended', () => {
  expect(remarkPlugins.anchorLinks).toBeTruthy()
  expect(remarkPlugins.paragraphCustomAlerts).toBeTruthy()
  expect(remarkPlugins.typography).toBeTruthy()
  expect(remarkPlugins.includeMarkdown).toBeTruthy()
  expect(remarkPlugins.allPlugins().length).toBe(4)
  // passes options correctly
  expect(remarkPlugins.allPlugins({ anchorLinks: 'foo' })[1][1]).toBe('foo')
  expect(remarkPlugins.allPlugins({ includeMarkdown: 'bar' })[0][1]).toBe('bar')
})
