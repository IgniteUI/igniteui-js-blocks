import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, HostListener, NgModule } from '@angular/core';

/**
 * Templates the default icon in the picker.
 *
 * @igxModule IgxDateCommonModule
 *
 * @igxKeyWords date range icon, date picker icon, time picker icon
 *
 * @igxGroup scheduling
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
 * Templates the default icon in the picker.
 *
 * @igxModule IgxDateCommonModule
 *
 * @igxKeyWords date range icon, date picker icon, time picker icon
 *
 * @igxGroup scheduling
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

/** @hidden @internal */
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
export class IgxPickerIconsModule { }
