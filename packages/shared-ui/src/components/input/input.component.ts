import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ui-input" [class.ui-input--error]="error()">
      @if (label()) {
        <span class="ui-input__label">{{ label() }}</span>
      }
      <input
        class="ui-input__field"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="blurred.emit()"
      />
      @if (error()) {
        <span class="ui-input__error">{{ error() }}</span>
      }
    </label>
  `,
  styles: `
    .ui-input {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;

      &__label {
        font-size: 14px;
        font-weight: 500;
        color: var(--ui-label-color, #374151);
      }

      &__field {
        padding: 10px 12px;
        border: 1px solid var(--ui-border-color, #d1d5db);
        border-radius: var(--ui-border-radius, 8px);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        background: var(--ui-input-bg, #fff);
        color: var(--ui-text-color, #111827);

        &:focus {
          border-color: var(--ui-primary-color, #3b82f6);
          box-shadow: 0 0 0 2px var(--ui-primary-color-light, rgba(59, 130, 246, 0.15));
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &--error &__field {
        border-color: var(--ui-error-color, #ef4444);
      }

      &__error {
        font-size: 12px;
        color: var(--ui-error-color, #ef4444);
      }
    }
  `,
})
export class UiInputComponent {
  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly error = input<string>('');

  readonly valueChange = output<string>();
  readonly blurred = output<void>();

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }
}
