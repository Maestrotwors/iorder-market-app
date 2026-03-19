import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-supplier',
  standalone: true,
  template: `<h1>Supplier</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierComponent {}
