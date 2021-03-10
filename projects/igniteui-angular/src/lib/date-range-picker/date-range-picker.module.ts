import { NgModule } from '@angular/core';
import { IgxDateRangePickerComponent } from './date-range-picker.component';
import { IgxCalendarModule } from '../calendar/public_api';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxInputGroupModule } from '../input-group/public_api';
import { IgxIconModule } from '../icon/public_api';
import {
    IgxDateRangeStartComponent, IgxDateRangeEndComponent,
    DateRangePickerFormatPipe,
    IgxDateRangeSeparatorDirective,
    IgxDateRangeInputsBaseComponent
} from './date-range-picker-inputs.common';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor/public_api';
import { IgxPickersCommonModule } from '../date-common/picker-icons.common';

/** @hidden */
@NgModule({
    declarations: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxDateRangeInputsBaseComponent,
        DateRangePickerFormatPipe,
        IgxDateRangeSeparatorDirective
    ],
    imports: [
        CommonModule,
        IgxIconModule,
        IgxButtonModule,
        IgxToggleModule,
        IgxCalendarModule,
        IgxInputGroupModule,
        IgxPickersCommonModule,
        IgxDateTimeEditorModule
    ],
    exports: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxDateRangeSeparatorDirective,
        IgxDateTimeEditorModule,
        IgxInputGroupModule
    ]
})
export class IgxDateRangePickerModule { }
