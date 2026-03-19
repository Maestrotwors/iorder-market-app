import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="landing">
      <h1>iOrder Market</h1>
      <p>E-commerce platform for buyers and suppliers</p>
      <div class="landing-actions">
        <a routerLink="/customer" class="btn btn-primary">Start Shopping</a>
        <a routerLink="/supplier" class="btn btn-secondary">Become a Supplier</a>
      </div>
    </section>
  `,
  styles: `
    .landing {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }

    .landing-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
  `,
})
export class LandingComponent {}
