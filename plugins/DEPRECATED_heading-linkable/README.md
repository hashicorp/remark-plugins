# Linkable Headings

This plugin processes headings to generate a slug and adds a **permalink** element and an invisible **target** element. These two elements ensure that users are able to click a link next to the heading to quickly get an anchor link directly to the heading slug, and that developers are able to customize the position that the headline appears when that anchor link is visited, respectively.

### Input:

```mdx
# First Level Heading

## Second Level Heading

Content here...
```

### Output:

```html
<h1>
  <a
    href="#first-level-heading"
    class="anchor"
    aria-label="first level heading permalink"
    >»</a
  >
  <a id="first-level-heading" class="__target" aria-hidden></a>
  First Level Heading
</h1>

<h2 id="second-level-heading">
  <a
    href="#second-level-heading"
    class="anchor"
    aria-label="second level heading permalink"
    >»</a
  >
  <a id="second-level-heading" class="__target" aria-hidden></a>
  Second Level Heading
</h2>

<p>Content here...</p>
```

Since the `__target` element actually carries the id rather than the headline, it can be positioned independently to pad the headline off the top of the page if necessary, which is the case any time we use a "sticky" navigation.

## Options

- `compatibilitySlug` _(optional)_ - if present, will generate an additional target element using a custom slug creation algorithm. Accepts a function with the following signature `fn(text: string)`. The `text` argument is the headline text, if the `compatibilitySlug` function generates an idential slug as the default, it will not be added at all.

  > **NOTE:** Be conscious of duplicate tracking with your compatibility function. If it needs to keep track of existing slugs on the page to avoid duplicates, it must implement that functionality on its own. Default slugs are not exposed to the `compatibilitySlug` function because this offers a footgun that can easily break compatibility. The `compatibilitySlug` function should operate entirely in its own sphere -- if it happens to generate a duplicate slug, the plugin itself will remove it as compatibility isn't necessary in that instance.
