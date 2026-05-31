# Error Handling & HTTP Patterns

## HTTP Services Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.apiUrl;

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.BASE_URL}${path}`);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.BASE_URL}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.BASE_URL}${path}`, body);
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}${path}`);
  }
}
```

## Error Interceptor Pattern

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redirect to login
      }
      if (error.status === 403) {
        // Show forbidden message
      }
      if (error.status >= 500) {
        // Show server error notification
      }
      return throwError(() => error);
    })
  );
};
```

## Loading State Pattern

```typescript
// Use discriminated unions for data state
interface IdleState { status: 'idle' }
interface LoadingState { status: 'loading' }
interface SuccessState<T> { status: 'success'; data: T }
interface ErrorState { status: 'error'; message: string }

type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

// In components with signals
protected readonly state = signal<AsyncState<User[]>>({ status: 'idle' });

async loadUsers(): Promise<void> {
  this.state.set({ status: 'loading' });
  try {
    const data = await firstValueFrom(this.userService.getAll());
    this.state.set({ status: 'success', data });
  } catch {
    this.state.set({ status: 'error', message: 'Failed to load users' });
  }
}
```

## Template Loading States

```html
@switch (state().status) {
  @case ('loading') {
    <app-skeleton />
  }
  @case ('error') {
    <app-error-message [message]="state().message" (retry)="loadUsers()" />
  }
  @case ('success') {
    @for (user of state().data; track user.id) {
      <app-user-card [user]="user" />
    } @empty {
      <app-empty-state message="No users found" />
    }
  }
}
```

## Form Validation Errors

```typescript
// Centralized validation messages
const VALIDATION_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'This field is required',
  email: () => 'Enter a valid email address',
  minlength: (p) => `Minimum ${p?.['requiredLength']} characters`,
  maxlength: (p) => `Maximum ${p?.['requiredLength']} characters`,
  pattern: () => 'Invalid format',
};
```

## Rules

- Always handle loading, success, error, and empty states
- Never swallow errors silently
- Use typed error responses from API
- Show user-friendly messages, log technical details
- Provide retry mechanisms for recoverable errors
- Use skeleton loaders instead of spinners when possible
