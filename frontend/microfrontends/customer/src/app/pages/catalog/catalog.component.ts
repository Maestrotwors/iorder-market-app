import { Component, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { IProduct } from '@iorder/shared-contracts';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="catalog">
      <h1>Product Catalog</h1>
      <p>Real-time updates via SSE · <strong>{{ products().length }}</strong> products</p>
      <ul>
        @for (product of products(); track product.id) {
          <li>
            <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
            <span> — {{ product.price | currency }}</span>
          </li>
        }
      </ul>
    </section>
  `,
})
export class CatalogComponent {
  products = signal<Partial<IProduct>[]>([
    { id: '1', name: 'Sample Product A', price: 29.99 },
    { id: '2', name: 'Sample Product B', price: 49.99 },
  ]);
}
