import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="ui-button"
      [class]="'ui-button ui-button--' + variant() + ' ui-button--' + size()"
      [disabled]="disabled() || loading()"
      [type]="type()"
      (click)="clicked.emit()"
    >
      @if (loading()) {
        <span class="ui-button__spinner"></span>
      }
      <ng-content />
    </button>
  `,
  styles: `
    .ui-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      border-radius: var(--ui-border-radius, 8px);
      font-weight: 500;
      cursor: pointer;
      transition:
        background-color 0.2s,
        opacity 0.2s;
      width: 100%;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &--sm {
        padding: 6px 12px;
        font-size: 13px;
      }
      &--md {
        padding: 10px 20px;
        font-size: 14px;
      }
      &--lg {
        padding: 14px 28px;
        font-size: 16px;
      }

      &--primary {
        background: var(--ui-primary-color, #3b82f6);
        color: #fff;
        &:hover:not(:disabled) {
          background: var(--ui-primary-hover, #2563eb);
        }
      }
      &--secondary {
        background: var(--ui-secondary-color, #6b7280);
        color: #fff;
        &:hover:not(:disabled) {
          background: var(--ui-secondary-hover, #4b5563);
        }
      }
      &--outline {
        background: transparent;
        border: 1px solid var(--ui-border-color, #d1d5db);
        color: var(--ui-text-color, #374151);
        &:hover:not(:disabled) {
          background: var(--ui-hover-bg, #f3f4f6);
        }
      }
      &--ghost {
        background: transparent;
        color: var(--ui-text-color, #374151);
        &:hover:not(:disabled) {
          background: var(--ui-hover-bg, #f3f4f6);
        }
      }
      &--danger {
        background: var(--ui-error-color, #ef4444);
        color: #fff;
        &:hover:not(:disabled) {
          background: #dc2626;
        }
      }

      &__spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: ui-spin 0.6s linear infinite;
      }
    }

    @keyframes ui-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class UiButtonComponent {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<void>();
}
