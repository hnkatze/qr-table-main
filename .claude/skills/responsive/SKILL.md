---
name: responsive
description: >
  Responsive design patterns and rules for Tailwind CSS v4, including container queries,
  viewport breakpoints, PrimeNG, and vanilla CSS. Framework-agnostic frontend patterns.
  Trigger: When building UI, creating layouts, working on responsive design, or reviewing mobile/tablet/desktop views.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.0"
allowed-tools: Read, Edit, Glob, Grep
---

## When to Use

- Building any UI component, page, or layout
- User mentions "responsive", "mobile", "tablet", "breakpoints", "container queries"
- Reviewing templates for responsive compliance
- Working with grids, navigation, tables, or forms

---

## Core Principle

**Mobile-first. Always.** Start with the smallest screen, layer up with breakpoints.

```html
<!-- ✅ CORRECT — mobile base, scale up -->
<div class="p-4 md:p-6 lg:p-8">
  <h1 class="text-xl md:text-2xl lg:text-3xl">Title</h1>
</div>

<!-- ❌ WRONG — desktop-first, scaling down -->
<div class="p-8 sm:p-4">
  <h1 class="text-3xl sm:text-xl">Title</h1>
</div>
```

---

## Responsive Strategy: Viewport vs Container

### Viewport Breakpoints — Page-Level Layout

Use `sm:`, `md:`, `lg:` for page structure, navigation, and full-width sections:

```html
<!-- Page layout: sidebar + content -->
<div class="flex min-h-screen">
  <aside class="hidden lg:block lg:w-64">Sidebar</aside>
  <main class="flex-1 p-4 md:p-8">Content</main>
</div>
```

### Container Queries — Component-Level Layout (v4)

Use `@container` + `@sm:`, `@md:` for reusable components that live in flexible containers:

```html
<!-- Card adapts to its container, not viewport -->
<div class="@container">
  <article class="flex flex-col @sm:flex-row gap-4">
    <img class="w-full @sm:w-40 aspect-video object-cover rounded-lg" src="..." alt="..." />
    <div>
      <h3 class="font-bold @md:text-lg">Title</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">Description</p>
    </div>
  </article>
</div>

<!-- Named container for nested queries -->
<div class="@container/card">
  <div class="@md/card:grid-cols-2 grid grid-cols-1 gap-4">...</div>
</div>
```

### When to Use Which

| Scenario | Use |
|----------|-----|
| Page layout (header, sidebar, footer) | Viewport (`md:`, `lg:`) |
| Navigation collapse | Viewport (`md:hidden`, `md:flex`) |
| Reusable card in different contexts | Container (`@container`, `@sm:`) |
| Widget in sidebar AND main content | Container (`@container`) |
| Dashboard tiles/panels | Container (`@container`) |
| Hero section | Viewport (`md:`, `lg:`) |
| Form layout (page-level) | Viewport (`md:grid-cols-2`) |
| Form inside modal/drawer | Container (`@md:grid-cols-2`) |

---

## Breakpoint System

### Tailwind Viewport Breakpoints

| Prefix | Min-width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile (base) |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### Tailwind Container Breakpoints (v4)

| Prefix | Min-width | Typical use |
|--------|-----------|-------------|
| `@xs:` | 320px | Narrow sidebar widgets |
| `@sm:` | 384px | Small cards |
| `@md:` | 448px | Medium panels |
| `@lg:` | 512px | Wide panels |
| `@xl:` | 576px | Full-width cards |
| `@2xl:` | 672px | Large containers |

### Test Widths

Always verify at: **320px**, **768px**, **1024px**, **1440px**.

---

## Layout Patterns

### 1. Responsive Grid

```html
<!-- Cards: 1 col → 2 col → 3 col → 4 col -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  <div>Card</div>
</div>

<!-- Container-aware grid (reusable component) -->
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
    <div>Card</div>
  </div>
</div>
```

### 2. Sidebar Layout

```html
<div class="flex min-h-screen">
  <!-- Sidebar: hidden on mobile, shown on desktop -->
  <aside class="hidden lg:block lg:w-64 xl:w-72 shrink-0 border-r dark:border-gray-800">
    <nav class="sticky top-0 p-4">...</nav>
  </aside>

  <!-- Main content fills remaining space -->
  <main class="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
    <slot />
  </main>
</div>
```

### 3. Header / Navbar

```html
<header class="flex items-center justify-between px-4 py-3 md:px-6">
  <a href="/" class="text-lg font-bold">Logo</a>

  <!-- Desktop nav -->
  <nav class="hidden md:flex items-center gap-6">
    <a href="/about" class="hover:text-blue-600 transition-colors">About</a>
    <a href="/contact" class="hover:text-blue-600 transition-colors">Contact</a>
  </nav>

  <!-- Mobile hamburger -->
  <button class="md:hidden p-2 min-h-[44px] min-w-[44px]" aria-label="Open menu">
    <svg class="w-6 h-6" aria-hidden="true">...</svg>
  </button>
</header>
```

### 4. Hero Section

```html
<section class="px-4 py-12 md:px-8 md:py-20 lg:py-28 text-center">
  <h1 class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
    Headline
  </h1>
  <p class="mt-4 text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
    Subtitle
  </p>
  <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
    <button class="w-full sm:w-auto px-6 py-3">Primary</button>
    <button class="w-full sm:w-auto px-6 py-3">Secondary</button>
  </div>
</section>
```

### 5. Content + Image (Alternating)

```html
<div class="flex flex-col md:flex-row items-center gap-6 md:gap-10">
  <div class="w-full md:w-1/2">
    <h2 class="text-2xl md:text-3xl font-bold">Feature</h2>
    <p class="mt-3 text-gray-600 dark:text-gray-400">Description</p>
  </div>
  <div class="w-full md:w-1/2">
    <img src="feature.webp" alt="Feature screenshot" class="rounded-lg aspect-video object-cover" />
  </div>
</div>
```

### 6. Footer

```html
<footer class="px-4 py-8 md:px-8 md:py-12">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
    <div>
      <h3 class="font-semibold mb-3">Product</h3>
      <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">...</ul>
    </div>
  </div>
  <div class="mt-8 pt-6 border-t dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
    <p>&copy; 2026 Company</p>
    <div class="flex gap-4">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
</footer>
```

---

## Component Patterns

### Responsive Typography

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | `text-2xl` | `text-3xl`–`text-4xl` | `text-4xl`–`text-5xl` |
| H2 | `text-xl` | `text-2xl` | `text-3xl` |
| H3 | `text-lg` | `text-xl` | `text-2xl` |
| Body | `text-sm` | `text-base` | `text-base`–`text-lg` |
| Caption | `text-xs` | `text-sm` | `text-sm` |

### Responsive Spacing

| Context | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Page padding | `px-4 py-6` | `px-8 py-10` | `px-12 py-16` |
| Section gap | `gap-3` | `gap-4` | `gap-6` |
| Card padding | `p-4` | `p-5` | `p-6` |
| Stack spacing | `space-y-3` | `space-y-4` | `space-y-6` |

### Touch Targets

```html
<!-- Minimum 44x44px for all interactive elements on mobile -->
<button class="min-h-11 min-w-11 px-4 py-2">Action</button>

<!-- Icon buttons -->
<button class="p-3 md:p-2" aria-label="Close">
  <svg class="w-5 h-5" aria-hidden="true">...</svg>
</button>

<!-- Links in lists -->
<a href="/item" class="block py-3 px-4 md:py-2">Menu Item</a>
```

### Responsive Images

```html
<!-- Responsive sizes attribute -->
<img
  src="hero.webp"
  alt="Hero image"
  class="w-full aspect-video object-cover rounded-lg"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
/>

<!-- Avatar that scales -->
<img
  src="avatar.webp"
  alt="User avatar"
  class="w-10 h-10 md:w-12 md:h-12 rounded-full"
/>
```

---

## PrimeNG Responsive Patterns

### Responsive Table

```html
<p-table [value]="items()" [responsiveLayout]="'stack'" [breakpoint]="'768px'">
  ...
</p-table>
```

### Responsive Dialog

```html
<p-dialog
  [style]="{ width: '90vw' }"
  [breakpoints]="{ '768px': '95vw', '1024px': '70vw', '1280px': '50vw' }"
>
  ...
</p-dialog>
```

### PrimeNG + Tailwind Grid

```html
<!-- Use Tailwind grid, not PrimeNG grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  @for (item of items(); track item.id) {
    <p-card [header]="item.title" styleClass="h-full">...</p-card>
  }
</div>
```

---

## Visibility & Conditional Display

```html
<div class="block md:hidden">Mobile only</div>
<div class="hidden md:block lg:hidden">Tablet only</div>
<div class="hidden lg:block">Desktop only</div>

<!-- Truncate on mobile, full text on desktop -->
<p class="truncate md:whitespace-normal">Long text...</p>
```

---

## Container Widths

```html
<!-- Constrain content on large screens -->
<div class="max-w-7xl mx-auto px-4 md:px-8">Content</div>

<!-- Prose/reading width -->
<article class="max-w-prose mx-auto px-4">Optimal reading width</article>
```

---

## Anti-Patterns

### ❌ DON'T

```html
<div class="w-[800px]">Fixed width breaks mobile</div>
<div class="h-[400px] overflow-hidden">Fixed height clips content</div>
<div class="p-8 sm:p-4">Desktop-first direction</div>
<p class="text-[10px]">Text too small</p>
<p-dialog [style]="{ width: '600px' }">Breaks on mobile</p-dialog>
```

### ✅ DO

```html
<div class="w-full max-w-4xl">Fluid with constraint</div>
<div class="min-h-[200px] md:min-h-[400px]">Min-height, not fixed</div>
<div class="p-4 md:p-6 lg:p-8">Mobile-first direction</div>
<p class="text-sm md:text-base">Readable minimum</p>
<p-dialog [breakpoints]="{ '768px': '95vw', '1024px': '60vw' }">Responsive</p-dialog>
```

---

## Responsive Checklist

- [ ] Starts with mobile styles (no breakpoint prefix = mobile)
- [ ] Text readable at 320px (minimum `text-sm` / 14px)
- [ ] Touch targets 44x44px minimum on mobile
- [ ] No horizontal scroll at any breakpoint
- [ ] Images use `sizes` attribute or explicit responsive dimensions
- [ ] Forms single-column on mobile
- [ ] Tables use stack layout or scroll on mobile
- [ ] Navigation collapses to hamburger/drawer on mobile
- [ ] Dialogs/modals use breakpoint-aware widths
- [ ] Buttons stack vertically on mobile, inline on desktop
- [ ] Containers have `max-w-*` on large screens
- [ ] Spacing scales with breakpoints
- [ ] No fixed pixel widths without `max-w-full` safety
- [ ] Reusable components use `@container` queries where appropriate
- [ ] `motion-reduce:` on all animations
- [ ] Hidden content on mobile is truly non-essential
