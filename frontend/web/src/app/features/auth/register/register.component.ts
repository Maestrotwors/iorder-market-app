import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegisterStore } from './register.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  providers: [RegisterStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-page">
      <h2>Register</h2>

      @if (registerStore.error()) {
        <p class="error">{{ registerStore.error() }}</p>
      }

      <form (ngSubmit)="onSubmit()">
        <label>
          Name
          <input type="text" [(ngModel)]="name" name="name" required autocomplete="name" />
        </label>

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
            minlength="8"
            autocomplete="new-password"
          />
        </label>

        <button type="submit" [disabled]="registerStore.loading()">
          {{ registerStore.loading() ? 'Creating account...' : 'Register' }}
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
  readonly registerStore = inject(RegisterStore);
  name = '';
  email = '';
  password = '';

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) return;
    this.registerStore.register(this.name, this.email, this.password);
  }
}
