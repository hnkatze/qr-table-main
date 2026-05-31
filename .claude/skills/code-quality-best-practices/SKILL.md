---
description: >
  Code quality standards: proactive review, error handling, loading states, accessibility,
  and performance patterns. Framework-agnostic frontend best practices.
  Use to review code, implement best practices, improve performance, and ensure accessibility.
---

# Code Quality & Performance Standards

## Proactive Code Review

**ALWAYS** suggest improvements when you see opportunities to enhance:
- Code quality and type safety
- Performance and bundle size
- Accessibility (a11y)
- User experience (loading, error, empty states)
- Security basics

## Areas to Watch

### 1. Code Simplification

Look for:
- Redundant code that can be simplified
- Repeated logic that should be extracted into a function/component
- Overly complex conditionals (3+ branches → extract or use lookup table)
- Duplicate code across components

### 2. Performance

Identify:
- Unnecessary re-renders (missing memoization, signals, or trackBy)
- Heavy computations in templates (move to computed/derived state)
- Missing `track` in loops (Angular `@for`, React `key`)
- Unsubscribed listeners/subscriptions (memory leaks)
- Large bundle imports (`import lodash` instead of `import { debounce } from 'lodash-es'`)
- Images without lazy loading or proper `sizes`
- `transition-all` when specific property suffices

### 3. Type Safety

Ensure:
- No `any` types — use `unknown` + type guards
- `import type` for type-only imports
- `as const` for literal values and creating unions from arrays
- `satisfies` for config validation without type widening
- Discriminated unions for state management
- Proper generic constraints
- Result pattern for fallible operations

### 4. State Management

Verify:
- Appropriate reactive state (signals, hooks, stores)
- No unnecessary state (derived values should be computed, not stored)
- Proper `readonly` patterns (immutable by default)
- Loading/error/success states properly typed as discriminated unions

## Accessibility Standards

### Semantic HTML

```html
<!-- ✅ Semantic structure -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Page Title</h1>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section</h2>
      <p>Content</p>
    </section>
  </article>
</main>

<!-- ❌ Div soup -->
<div class="nav"><div><a href="/home">Home</a></div></div>
```

### Interactive Elements

```html
<!-- ✅ Buttons for actions, links for navigation -->
<button type="button" aria-label="Delete user">
  <svg aria-hidden="true">...</svg>
</button>

<a href="/users/123">View user profile</a>

<!-- ❌ Div with click handler -->
<div onclick="delete()">Delete</div>
```

### Forms

```html
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-error" required />
<span id="email-error" role="alert">Please enter a valid email</span>
```

### Images

```html
<!-- Informative -->
<img src="chart.png" alt="Sales increased 25% in Q4 2025" />

<!-- Decorative -->
<img src="divider.png" alt="" aria-hidden="true" />
```

### Keyboard & Focus

- All interactive elements reachable with Tab
- Focus visible on all elements (never `outline: none` without replacement)
- Modals trap focus
- Escape closes modals/dropdowns
- Touch targets minimum 44x44px

### Color & Contrast

- 4.5:1 contrast for normal text, 3:1 for large text
- Never rely on color alone to convey information
- `motion-reduce:` on all animations

## Error Handling

### Typed Async State

```typescript
// Discriminated union for data state
interface IdleState { status: 'idle' }
interface LoadingState { status: 'loading' }
interface SuccessState<T> { status: 'success'; data: T }
interface ErrorState { status: 'error'; message: string }
type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;
```

### User-Friendly Messages

```typescript
// ✅ Helpful message with action
showNotification({
  type: 'error',
  title: 'Save Failed',
  message: 'Unable to save changes. Please check your connection and try again.',
});

// ❌ Cryptic message
showNotification({ type: 'error', message: error.message });
```

### Result Pattern

```typescript
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await api.get<User>(`/users/${id}`);
    return { ok: true, data: user };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

## Loading States

### Always Show Loading Feedback

```html
<!-- Use skeleton loaders over spinners for better UX -->
@switch (state().status) {
  @case ('loading') { <app-skeleton /> }
  @case ('error') { <app-error [message]="state().message" (retry)="load()" /> }
  @case ('success') {
    @for (item of state().data; track item.id) {
      <app-item-card [item]="item" />
    } @empty {
      <app-empty-state message="No items found" />
    }
  }
}
```

### Button Loading State

```html
<button
  type="submit"
  [disabled]="isSaving()"
  class="min-w-[120px] transition-colors"
>
  @if (isSaving()) {
    <svg class="animate-spin w-5 h-5" aria-hidden="true">...</svg>
    <span>Saving...</span>
  } @else {
    <span>Save</span>
  }
</button>
```

## Empty States

Always handle when data is empty:

```html
@if (items().length === 0 && !isLoading()) {
  <div class="text-center py-12" role="status">
    <svg class="mx-auto w-12 h-12 text-gray-400" aria-hidden="true">...</svg>
    <h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No items</h3>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating one.</p>
    <button class="mt-4" (click)="create()">Create New</button>
  </div>
}
```

## Performance Best Practices

### Lazy Loading

```typescript
// Lazy load routes
{ path: 'users', loadComponent: () => import('./features/users/user-list') }

// Lazy load heavy components
const Chart = lazy(() => import('./components/Chart'));
```

### Resource Cleanup

```typescript
// Angular: takeUntilDestroyed
private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
  this.service.data$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => this.state.set(data));
}
```

### Bundle Optimization

```typescript
// ✅ Named import (tree-shakeable)
import { debounce } from 'lodash-es';

// ❌ Full import
import _ from 'lodash';
```

## Code Review Checklist

- [ ] No `any` types — use `unknown` + type guards
- [ ] `import type` for type-only imports
- [ ] Proper error handling (no empty catches)
- [ ] Loading states shown (skeleton/spinner)
- [ ] Empty states handled
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation works
- [ ] Alt text on all images
- [ ] Color contrast sufficient (4.5:1)
- [ ] `motion-reduce:` on animations
- [ ] Resources cleaned up (subscriptions, listeners)
- [ ] Forms have validation messages
- [ ] Touch targets 44px minimum
- [ ] No `console.log` in production
- [ ] User-friendly error messages
