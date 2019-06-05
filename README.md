# HashiCorp Remark Plugins

A potpourri of [remark](https://github.com/remarkjs/remark) plugins used by [HashiCorp](https://www.hashicorp.com/) to process markdown files.

## Overview

[MDX](https://mdxjs.com) uses [remark](https://github.com/remarkjs/remark) internally to process and transform markdown via [plugins](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins). We use MDX to process markdown content to build out our docs, learning guides, and write rich content from our CMS. This set of plugins ensures that written markdown is translated properly into markup.

### Linkable Headings

The `headingLinkable` plugin adds anchor links to our headings so that users are able to easily link to a specific heading even if it is further down the page. See [its readme](plugins/heading-linkable/README.md) for more details.

### Linkable Inline Code

The `inlineCodeLinkable` plugin adds anchor links when a list begins with an `inline code` element. In many places in our docs, there are lists of methods that are structured this way, and this plugin makes it easier for users to link to a specific method. See [its readme](plugins/inline-code-linkable/README.md) for more details.

### Custom Alerts

The `paragraphCustomAlerts` plugin adds a custom syntax for creating alert boxes. See [its readme](plugins/inline-code-linkable/README.md) for more details. This plugin will be deprecated for a `<Alert />` component in the future in a step to move us toward full [commonmark](https://commonmark.org/) compliance.

### Typography

The `typography` plugin adds css classes to certain typographical elements so that they adhere to the typography standards from our design system. See [its readme](plugins/inline-code-linkable/README.md) for more details.

## Usage

Each of the plugins are exposed as the default export from this module and can be used as any other remark plugin would be normally. For example, with raw mdx:

```js
const mdx = require('@mdx-js/mdx')
const {typography, headingLinkable} = require('@hashicorp/remark-plugins')

console.log(mdx.sync('some markdown content', {
  remarkPlugins: [typography, headingLinkable]
})
```

If you are using `next-hashicorp`, all of these plugins will be included by default.
