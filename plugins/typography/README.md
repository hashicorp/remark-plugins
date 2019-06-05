# Heading Type Styles

We use a set of global classes for type styling at HashiCorp. This plugin adds type styles to the appropriate elements so that content looks as intended within rendered markdown blocks without duplicating or extending css.
More details to come via our design system 😀

### Input

```mdx
# Uses

Here are some uses...

## Another title

Here is some more stuff...
```

### Output

```jsx
<h1 className='g-type-display-2'>Uses</h1>

<p>Here are some uses...</p>

<h2 className='g-type-section-1'>Another title</h2>

<p>Here is some more stuff...</p>
```
