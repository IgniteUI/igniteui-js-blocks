import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, HostListener, NgModule } from '@angular/core';

/**
 * Templates the default toggle icon in the picker.
 *
 * @example
 * ```html
 * <igx-date-range-picker>
 *   <igx-picker-toggle igxSuffix>
 *      <igx-icon>calendar_view_day</igx-icon>
 *   </igx-picker-toggle>
 * </igx-date-range-picker>
 * ```
 */
@Component({
    template: `<ng-content></ng-content>`,
    selector: 'igx-picker-toggle'
})
export class IgxPickerToggleComponent {
    @Output()
    public clicked = new EventEmitter();

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        // do not focus input on click
        event.stopPropagation();
        this.clicked.emit();
    }
}

/**
 * Templates the default clear icon in the picker.
 *
 * @example
 * ```html
 * <igx-date-picker>
 *   <igx-picker-clear igxSuffix>
 *      <igx-icon>delete</igx-icon>
 *   </igx-picker-clear>
 * </igx-date-picker>
 * ```
 */
@Component({
    template: `<ng-content></ng-content>`,
    selector: 'igx-picker-clear'
})
export class IgxPickerClearComponent extends IgxPickerToggleComponent { }

/** @hidden */
@NgModule({
    declarations: [
        IgxPickerToggleComponent,
        IgxPickerClearComponent
    ],
    imports: [CommonModule],
    exports: [
        IgxPickerToggleComponent,
        IgxPickerClearComponent
    ]
})
export class IgxPickersCommonModule { }
