# Accessibility Standards (a11y)

## Required in ALL Components

### Semantic HTML
- Use `<button>` for actions, `<a>` for navigation (NEVER `<div>` with click)
- Use `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`
- Use heading hierarchy: `<h1>` → `<h2>` → `<h3>` (never skip levels)
- Use `<ul>`/`<ol>` for lists, `<table>` for tabular data

### Interactive Elements
- All buttons/links must have accessible text
- Icon-only buttons need `aria-label`
- Form inputs must have associated `<label>` or `aria-label`
- Focus must be visible (never `outline: none` without replacement)

```html
<!-- BAD -->
<div (click)="save()">Save</div>
<i class="icon-trash"></i>

<!-- GOOD -->
<button (click)="save()">Save</button>
<button aria-label="Delete item">
  <i class="icon-trash" aria-hidden="true"></i>
</button>
```

### Forms
```html
<!-- Always associate labels -->
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-error" />
<span id="email-error" role="alert">Enter a valid email</span>

<!-- Group related fields -->
<fieldset>
  <legend>Shipping Address</legend>
  <!-- fields -->
</fieldset>
```

### Images
```html
<!-- Informative images need alt text -->
<img [ngSrc]="photo" alt="User profile photo" />

<!-- Decorative images -->
<img [ngSrc]="decoration" alt="" aria-hidden="true" />
```

### Keyboard Navigation
- All interactive elements must be reachable with Tab
- Custom components need `tabindex="0"` if interactive
- Modals must trap focus
- Escape key should close modals/dropdowns

### ARIA Patterns
```html
<!-- Alerts -->
<div role="alert">Operation completed successfully</div>

<!-- Live regions for dynamic content -->
<div aria-live="polite">{{ itemCount }} results found</div>

<!-- Expandable sections -->
<button [attr.aria-expanded]="isOpen()" aria-controls="panel-1">Details</button>
<div id="panel-1" [hidden]="!isOpen()">Content</div>

<!-- Tabs -->
<div role="tablist">
  <button role="tab" [attr.aria-selected]="isActive()">Tab 1</button>
</div>
<div role="tabpanel">Content</div>
```

### Color & Contrast
- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text
- Never rely on color alone to convey information
- Provide text alternatives for color-coded states

## Quick Checklist
- [ ] All images have appropriate alt text
- [ ] All form inputs have labels
- [ ] All buttons/links have accessible names
- [ ] Focus is visible on all interactive elements
- [ ] Keyboard navigation works without a mouse
- [ ] Color is not the only way to convey info
- [ ] Heading levels are sequential
- [ ] Dynamic content uses aria-live or role="alert"
