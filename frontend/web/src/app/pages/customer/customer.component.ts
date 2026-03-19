import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-customer',
  standalone: true,
  template: `<h1>Customer</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerComponent {}
