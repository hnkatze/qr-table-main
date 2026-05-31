---
globs: ["**/*.tsx", "**/*.jsx", "**/*.astro", "**/*.html", "**/*.vue", "**/*.svelte"]
description: Tailwind CSS v4 usage rules. Always use Tailwind utilities, CSS only for animations.
---

# Tailwind CSS Rules (v4)

## Core Principle

**ALWAYS use Tailwind utility classes for styling. CSS files are ONLY for complex animations.**

## MUST Use Tailwind For

- Layout (flex, grid, positioning)
- Spacing (margin, padding, gap)
- Typography (font-size, weight, color)
- Colors (background, text, border)
- Borders (width, radius, style)
- Shadows
- Responsive design (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Container queries (`@container`, `@sm:`, `@md:`, `@lg:`)
- Hover/focus/active states
- Dark mode (`dark:`)
- Transitions (simple ones)

## CSS Files ONLY For

- Complex `@keyframes` animations (multi-step, custom timing)
- Third-party library overrides that require specificity
- Nothing else — not layout, not colors, not spacing

## Tailwind v4 Features — Use These

### CSS-First Configuration

```css
/* v4: configure in CSS, not tailwind.config.js */
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;
  --color-brand-500: oklch(0.65 0.2 250);
  --color-brand-600: oklch(0.55 0.2 250);
  --breakpoint-3xl: 1920px;
}
```

### Container Queries

```html
<!-- Parent as query container -->
<div class="@container">
  <!-- Child adapts to CONTAINER size, not viewport -->
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
    <div>Card</div>
  </div>
</div>

<!-- Named containers -->
<div class="@container/sidebar">
  <nav class="@sm/sidebar:flex-row flex-col">...</nav>
</div>
```

### P3 Wide Gamut Colors (oklch)

```html
<!-- v4 uses oklch for more vibrant colors -->
<div class="bg-blue-500 text-white">Standard token</div>

<!-- Custom oklch in @theme for brand colors -->
<!-- Prefer theme tokens over arbitrary oklch values -->
```

### Cascade Layers

```css
/* v4 auto-generates layers: theme → base → components → utilities */
@layer components {
  .btn-primary {
    border-radius: calc(infinity * 1px);
    background-color: var(--color-brand-500);
    padding-inline: var(--spacing-5);
    padding-block: var(--spacing-2);
    font-weight: var(--font-weight-semibold);
    color: var(--color-white);

    &:hover {
      @media (hover: hover) {
        background-color: var(--color-brand-600);
      }
    }
  }
}
```

### CSS Variables for Dynamic Values

```html
<!-- Set CSS vars, consume with Tailwind -->
<div class="[--gutter:1rem] lg:[--gutter:2rem]">
  <div class="px-(--gutter)">Content</div>
</div>

<!-- Dynamic values from JS/data → use style + CSS var -->
<button
  style="--bg: {{ color }}; --bg-hover: {{ hoverColor }}"
  class="bg-(--bg) hover:bg-(--bg-hover)"
>
  Dynamic
</button>
```

## Examples

### Layout ✅ Tailwind

```html
<!-- ✅ Good -->
<div class="flex items-center justify-between gap-4 p-6">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Title</h1>
  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
    Action
  </button>
</div>

<!-- ❌ Bad - Don't use CSS for this -->
<div class="container">
  <h1 class="title">Title</h1>
  <button class="btn">Action</button>
</div>
```

### Responsive ✅ Mobile-First

```html
<!-- ✅ Good — base = mobile, scale up -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">Card</div>
</div>

<!-- ❌ Bad — desktop-first, max-* prefixes -->
<div class="grid grid-cols-3 max-md:grid-cols-1">Wrong direction</div>
```

### States ✅ Tailwind

```html
<button class="
  bg-blue-600 text-white rounded-lg px-4 py-2
  hover:bg-blue-700
  focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
  active:bg-blue-800
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors
">
  Button
</button>
```

### Group & Peer Variants

```html
<!-- Group: style children based on parent state -->
<a href="#" class="group rounded-lg p-6 hover:bg-gray-50">
  <h3 class="group-hover:text-blue-600 transition-colors">Title</h3>
  <span class="group-hover:underline">Read more</span>
</a>

<!-- Peer: style siblings based on sibling state -->
<input type="email" class="peer" placeholder="Email" />
<p class="hidden peer-invalid:block text-red-500 text-sm">Invalid email</p>
```

### Dark Mode

```html
<div class="bg-white dark:bg-gray-950 rounded-lg p-6 shadow-md dark:shadow-gray-950/20">
  <h3 class="text-gray-900 dark:text-white">Title</h3>
  <p class="text-gray-500 dark:text-gray-400">Description</p>
</div>
```

### Transitions ✅ Tailwind

```html
<!-- ✅ Specific transition property (better perf) -->
<div class="transition-colors duration-200 hover:bg-gray-100">Item</div>
<div class="transition-transform duration-300 hover:scale-105">Card</div>

<!-- ⚠️ Avoid transition-all when you know what changes -->
<div class="transition-all duration-300">Only if multiple props animate</div>
```

### Built-in Animations ✅ Use These

```html
<div class="animate-spin">Loading spinner</div>
<div class="animate-ping">Notification dot</div>
<div class="animate-pulse">Skeleton loader</div>
<div class="animate-bounce">Scroll indicator</div>
```

### Reduced Motion ✅ Always

```html
<!-- Respect user preference -->
<div class="animate-bounce motion-reduce:animate-none">Bouncing</div>
<div class="transition-transform hover:scale-105 motion-reduce:transform-none">Card</div>
```

## Managing Duplication (Priority Order)

1. **Loops/iteration** — render components in loops (best)
2. **Extract components** — reusable component abstractions (good)
3. **Multi-cursor editing** — for isolated cases (ok)
4. **`@layer components`** — only for single-element patterns in non-component templates (last resort)

```tsx
// ✅ Best — component extraction
function VacationCard({ img, title, price, url }) {
  return (
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <img class="rounded-lg aspect-video object-cover" src={img} alt={title} />
      <h3 class="mt-4 font-bold text-gray-900 dark:text-white">{title}</h3>
      <p class="text-gray-500 dark:text-gray-400">{price}</p>
    </div>
  );
}
```

## Managing Style Conflicts

```html
<!-- ❌ Conflicting utilities — later in stylesheet wins unpredictably -->
<div class="grid flex">DON'T</div>

<!-- ✅ Conditional — only one at a time -->
<div class={layout === 'grid' ? 'grid grid-cols-3' : 'flex gap-4'}>DO</div>
```

## Important Modifier (`!`)

```html
<!-- Force precedence when integrating with legacy CSS -->
<div class="bg-red-500!">Overrides other bg</div>

<!-- Prefix option for legacy CSS integration -->
<!-- @import "tailwindcss" prefix(tw); → .tw:text-red-500 -->
```

## Arbitrary Values — When OK

```html
<!-- ✅ OK: no Tailwind token exists -->
<div class="max-w-[calc(100%-2rem)]">Computed value</div>
<div class="grid grid-cols-[24rem_1fr_auto]">Complex grid</div>

<!-- ❌ BAD: Tailwind token exists -->
<div class="text-[14px]">Use text-sm instead</div>
<div class="bg-[#3b82f6]">Use bg-blue-500 instead</div>
<div class="p-[16px]">Use p-4 instead</div>
```

## When to Create CSS

Only when you need:

1. **Complex `@keyframes`** — multi-step animations with custom timing
2. **Third-party overrides** — specificity battles with external CSS
3. **Nothing else** — if it can be a utility, it should be

## Summary

| Use Case | Solution |
|----------|----------|
| Layout | Tailwind (`flex`, `grid`, `block`) |
| Spacing | Tailwind (`p-*`, `m-*`, `gap-*`) |
| Colors | Tailwind (`bg-*`, `text-*`, `border-*`) |
| Typography | Tailwind (`text-*`, `font-*`) |
| Borders | Tailwind (`border-*`, `rounded-*`) |
| Shadows | Tailwind (`shadow-*`) |
| Responsive (viewport) | Tailwind (`sm:`, `md:`, `lg:`, `xl:`) |
| Responsive (container) | Tailwind (`@container`, `@sm:`, `@lg:`) |
| Dark mode | Tailwind (`dark:`) |
| States | Tailwind (`hover:`, `focus-visible:`, `active:`) |
| Group/peer | Tailwind (`group-hover:`, `peer-invalid:`) |
| Transitions | Tailwind (`transition-colors`, `duration-*`) |
| Simple animations | Tailwind (`animate-spin`, `animate-pulse`) |
| Reduced motion | Tailwind (`motion-reduce:`) |
| Complex animations | CSS `@keyframes` only |
| Dynamic values | CSS variables + `bg-(--var)` pattern |
| Theming | `@theme {}` block in CSS |
