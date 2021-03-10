import { Component, ViewChild, Input, Output, EventEmitter, HostListener, HostBinding } from '@angular/core';
import { IgxCalendarComponent } from '../../calendar/public_api';
import { InteractionMode } from '../../core/enums';
import { IgxDatePickerActionsDirective } from '../../date-picker/date-picker.directives';

/** @hidden */
@Component({
    selector: 'igx-calendar-container',
    styles: [':host {display: block;}'],
    templateUrl: 'calendar-container.component.html'
})
export class IgxCalendarContainerComponent {
    @ViewChild('calendar', { static: true })
    public calendar: IgxCalendarComponent;

    @Input()
    public mode = InteractionMode.DropDown;

    @Input()
    public vertical = false;

    @Input()
    public cancelButtonLabel: string;

    @Input()
    public todayButtonLabel: string;

    @Input()
    public datePickerActions: IgxDatePickerActionsDirective;

    @Output()
    public calendarClose = new EventEmitter();

    @Output()
    public todaySelection = new EventEmitter();

    @HostBinding('class.igx-date-picker')
    public styleClass = 'igx-date-picker';

    @HostBinding('class.igx-date-picker--dropdown')
    public get dropdownCSS(): boolean {
        return this.mode === InteractionMode.DropDown;
    }

    @HostBinding('class.igx-date-picker--vertical')
    public get verticalCSS(): boolean {
        return this.vertical && this.mode === InteractionMode.Dialog;
    }

    @HostListener('keydown.esc', ['$event'])
    @HostListener('keydown.alt.arrowup', ['$event'])
    public onEscape(event) {
        event.preventDefault();
        this.calendarClose.emit();
    }

    /**  Returns whether the date-picker is in readonly dialog mode. */
    public get isReadonly() {
        return this.mode === InteractionMode.Dialog;
    }

    /** Emits close event for the calendar. */
    public emitCalendarClose() {
        this.calendarClose.emit();
    }

    /**  Emits today selection event for the calendar. */
    public selectToday() {
        this.todaySelection.emit();
    }
}
