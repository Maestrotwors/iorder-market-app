import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-page">
      <h2>Login</h2>

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          Email
          <input type="email" formControlName="email" autocomplete="email" />
        </label>

        <label>
          Password
          <input type="password" formControlName="password" autocomplete="current-password" />
        </label>

        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="auth-link">Don't have an account? <a routerLink="/register">Register</a></p>
    </section>
  `,
  styles: `
    .auth-page {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-weight: 500;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }

    button {
      padding: 0.75rem;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .error {
      color: #d32f2f;
      background: #fdecea;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    }

    .auth-link {
      margin-top: 1rem;
      text-align: center;
    }
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly errorMessage = signal('');
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        const role = res.user.role;
        const routeMap: Record<string, string> = {
          customer: '/customer',
          supplier: '/supplier',
          admin: '/admin',
        };
        this.router.navigateByUrl(routeMap[role] ?? '/customer');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }
}
