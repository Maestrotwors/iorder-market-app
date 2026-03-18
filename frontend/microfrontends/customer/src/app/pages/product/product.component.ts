import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  template: `<h1>Product Detail</h1><p>Product page — SSE for stock updates</p>`,
})
export class ProductComponent {
  constructor(private route: ActivatedRoute) {}
}
