import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `<h1>Admin</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {}
