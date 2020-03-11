# Anchor Links

This plugin processes headings and inline code blocks at the beginning of a list item to generate a slug and adds a **permalink** element and an invisible **target** element. These two elements ensure that users are able to click a link next to the heading, or click on the inline code block to quickly get an anchor link directly to the corresponding section, and that developers are able to customize the position that the section appears when that anchor link is visited, respectively.

### Input:

```mdx
# First Level Heading

- list item
- `code_block` - with text explanation

Content here...
```

### Output:

```html
<h1>
  <a
    href="#first-level-heading"
    class="__permalink-h"
    aria-label="first level heading permalink"
    >»</a
  >
  <a id="first-level-heading" class="__target-h" aria-hidden></a>
  First Level Heading
</h1>

<ul>
  <li>list item</li>
  <li>
    <a id="#code_block" class="__target-lic" aria-hidden></a>
    <a
      href="#code_block"
      class="__permalink-lic"
      aria-label="code_block permalink"
    >
      <code>code_block</code>
    </a>
    - with text explanation
  </li>
</ul>

<p>Content here...</p>
```

Since the `__target` element carries the `id` rather than the headline, it can be positioned independently to pad the headline off the top of the page if necessary, which is the case any time we use a "sticky" navigation. Also worth noting is that the `__target` and `__permalink` elements carry a category identifier after their classname, `h` for "heading" and `lic` for "list inline code", in order to make styling super clear and avoid any chance for conflicts.

## Options

- `compatibilitySlug` _(function, optional)_ - if present, will generate an additional target element using a custom slug creation algorithm. Accepts a function with the following signature `fn(text: string)`. The `text` argument is the headline text, if the `compatibilitySlug` function generates an idential slug as the default, it will not be added at all.

  > **NOTE:** Be conscious of duplicate tracking with your compatibility function. If it needs to keep track of existing slugs on the page to avoid duplicates, it must implement that functionality on its own. Default slugs are not exposed to the `compatibilitySlug` function because this offers a footgun that can easily break compatibility. The `compatibilitySlug` function should operate entirely in its own sphere -- if it happens to generate a duplicate slug, the plugin itself will remove it as compatibility isn't necessary in that instance.

- `listWithInlineCodePrefix` _(string, optional)_ - if present, will append a string to the beginning of each instance where lists with inline code at the beginning get an anchor link. This is also provided for compatibility reasons, as we previously used a separate plugin for lists with inline code that appended an `inlinecode` prefix to avoid conflicts.
