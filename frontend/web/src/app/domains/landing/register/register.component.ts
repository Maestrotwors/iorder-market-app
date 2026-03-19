import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-page">
      <h2>Register</h2>

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          Name
          <input type="text" formControlName="name" autocomplete="name" />
        </label>

        <label>
          Email
          <input type="email" formControlName="email" autocomplete="email" />
        </label>

        <label>
          Password
          <input type="password" formControlName="password" autocomplete="new-password" />
        </label>

        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="auth-link">Already have an account? <a routerLink="/login">Login</a></p>
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
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly errorMessage = signal('');
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const { name, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.register(name, email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/customer');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }
}
