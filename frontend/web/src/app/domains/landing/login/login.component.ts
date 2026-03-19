import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginStore } from './login.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  providers: [LoginStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-page">
      <h2>Login</h2>

      @if (loginStore.error()) {
        <p class="error">{{ loginStore.error() }}</p>
      }

      <form (ngSubmit)="onSubmit()">
        <label>
          Email
          <input type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
        </label>

        <label>
          Password
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
            autocomplete="current-password"
          />
        </label>

        <button type="submit" [disabled]="loginStore.loading()">
          {{ loginStore.loading() ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="auth-link">Don't have an account333? <a routerLink="/register">Register</a></p>
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
  readonly loginStore = inject(LoginStore);
  email = '';
  password = '';

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loginStore.login(this.email, this.password);
  }
}
