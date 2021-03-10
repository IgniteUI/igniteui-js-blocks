import { IgxLabelDirective } from './../directives/label/label.directive';
import { Component, ViewChild, NgModule, ElementRef, EventEmitter, DebugElement } from '@angular/core';
import { TestBed, fakeAsync, tick, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule, FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';
import { IgxTimePickerComponent, IgxTimePickerModule } from './time-picker.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/public_api';
import { configureTestSuite } from '../test-utils/configure-suite';
import { InteractionMode } from '../core/enums';
import { IgxIconModule } from '../icon/public_api';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IBaseCancelableBrowserEventArgs } from '../core/utils';

/* eslint-disable @typescript-eslint/no-use-before-define */
describe('IgxTimePicker', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxTimePickerTestingModule]
        }).compileComponents();
    }));

    afterEach(waitForAsync(() => {
        UIInteractions.clearOverlay();
    }));

    it('Initialize a TimePicker component', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const domTimePicker = fixture.debugElement.query(By.css('igx-time-picker')).nativeElement;

        expect(fixture.componentInstance).toBeDefined();
        expect(timePicker.displayTime).toBe('');
        expect(timePicker.id).toContain('igx-time-picker-');
        expect(domTimePicker.id).toContain('igx-time-picker-');

        timePicker.id = 'customTimePicker';
        fixture.detectChanges();

        expect(timePicker.id).toBe('customTimePicker');
        expect(domTimePicker.id).toBe('customTimePicker');
    }));

    it('Should display default and custom label', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerCustomLabelComponent);
        const testComponent = fixture.componentInstance;
        testComponent.mode = InteractionMode.DropDown;
        fixture.detectChanges();

        const dom = fixture.debugElement;
        let label = dom.query(By.directive(IgxLabelDirective)).nativeElement.innerText;
        expect(label).toEqual('Custom label');

        testComponent.customLabel = false;
        fixture.detectChanges();
        label = dom.query(By.directive(IgxLabelDirective)).nativeElement.innerText;
        expect(label).toEqual('Time');

        testComponent.mode = InteractionMode.Dialog;
        fixture.detectChanges();
        label = dom.query(By.directive(IgxLabelDirective)).nativeElement.innerText;
        expect(label).toEqual('Time');

        testComponent.customLabel = true;
        fixture.detectChanges();
        label = dom.query(By.directive(IgxLabelDirective)).nativeElement.innerText;
        expect(label).toEqual('Custom label');
    }));

    it('@Input properties', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        expect(timePicker.value).toEqual(new Date(2017, 7, 7, 3, 24, 17));
    }));

    it('TimePicker DOM input value', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const currentTime = new Date(2017, 7, 7, 3, 24, 17);
        const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:` +
            `${currentTime.getSeconds()} ${currentTime.getHours() > 12 ? 'PM' : 'AM'}`;

        const dom = fixture.debugElement;

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(valueFromInput).toEqual(formattedTime);
    }));

    it('Dialog header value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;

        // get time-picker value
        const testElementTime = fixture.componentInstance.dateValue;
        const formattedTestElementTime = `${testElementTime.getHours()}:${testElementTime.getMinutes()}` +
            `:${testElementTime.getSeconds()} ${testElementTime.getHours() >= 12 ? 'PM' : 'AM'}`;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        // get time from dialog header
        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        expect(formatedTimeFromPopupHeader).toBe(formattedTestElementTime);
    }));

    it('Dialog selected element position', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const expectedColumnElements = 7;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList')).nativeElement.children;
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList')).nativeElement.children;
        const secondsColumn: any = dom.query(By.css('.igx-time-picker__secondsList')).nativeElement.children;
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList')).nativeElement.children;

        // check element count
        expect(hourColumn.length).toBe(expectedColumnElements);
        expect(minuteColumn.length).toBe(expectedColumnElements);
        expect(secondsColumn.length).toBe(expectedColumnElements);
        expect(AMPMColumn.length).toBe(expectedColumnElements);

        // verify selected's position to be in the middle
        expect(hourColumn[3].classList).toContain('igx-time-picker__item--selected');
        expect(minuteColumn[3].classList).toContain('igx-time-picker__item--selected');
        expect(secondsColumn[3].classList).toContain('igx-time-picker__item--selected');
        expect(AMPMColumn[3].classList).toContain('igx-time-picker__item--selected');

    }));

    it('TimePicker open event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const target = dom.query(By.directive(IgxInputDirective));

        spyOn(timePicker.onOpened, 'emit');

        target.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        tick();

        expect(timePicker.onOpened.emit).toHaveBeenCalled();
    }));

    it('TimePicker Validation Failed event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithMInMaxTimeValueComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        // select time difference (-3, -3, 'AM')
        const middlePos = 3;
        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[middlePos - 3];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[middlePos - 3];
        const secondsColumn = dom.query(By.css('.igx-time-picker__secondsList'));
        const selectSeconds = secondsColumn.children[middlePos - 3];

        UIInteractions.simulateClickAndSelectEvent(selectHour);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectMinutes);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectSeconds);
        fixture.detectChanges();

        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = findByInnerText(AMPMColumn.children, 'AM');

        UIInteractions.simulateClickAndSelectEvent(selectAMPM);
        fixture.detectChanges();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];
        spyOn(timePicker.onValidationFailed, 'emit');

        OkButton.triggerEventHandler('click', {});
        tick();
        fixture.detectChanges();

        expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();
    }));

    it('Should display mask on cancel button click with bound null value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.componentInstance.dateValue = null;
        fixture.componentInstance.mode = 'dropdown';
        fixture.detectChanges();
        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        spyOn(timePicker.onValidationFailed, 'emit');

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const cancelButton = dom.query(By.css('.igx-button--flat'));
        UIInteractions.simulateClickAndSelectEvent(cancelButton);
        tick();
        fixture.detectChanges();

        expect(timePicker.onValidationFailed.emit).not.toHaveBeenCalled();
        expect(timePicker.displayValue).toEqual('--:--:-- --');
    }));

    it('TimePicker cancel button', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();
        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        // select time difference (2, -3, 'AM')
        const middlePos = 3;
        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[middlePos + 2];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[middlePos - 3];
        const secondsColumn = dom.query(By.css('.igx-time-picker__secondsList'));
        const selectSeconds = secondsColumn.children[middlePos - 3];

        UIInteractions.simulateClickAndSelectEvent(selectHour);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectMinutes);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectSeconds);
        fixture.detectChanges();

        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = findByInnerText(AMPMColumn.children, 'AM');

        UIInteractions.simulateClickAndSelectEvent(selectAMPM);
        fixture.detectChanges();

        const cancelButton = dom.queryAll(By.css('.igx-button--flat'))[0];

        spyOn(timePicker.onValueChanged, 'emit');

        UIInteractions.simulateClickAndSelectEvent(cancelButton);
        tick();
        fixture.detectChanges();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);

        expect(timePicker.onValueChanged.emit).not.toHaveBeenCalled();
    }));

    it('TimePicker ValueChanged event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[5];
        const hourValue = selectHour.nativeElement.innerText;

        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[2];
        const minuteValue = selectMinutes.nativeElement.innerText;

        const secondsColumn = dom.query(By.css('.igx-time-picker__secondsList'));
        const selectSeconds = secondsColumn.children[2];
        const secondsValue = selectSeconds.nativeElement.innerText;

        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = AMPMColumn.children[4];
        const aMPMValue = selectAMPM.nativeElement.innerText;

        UIInteractions.simulateClickAndSelectEvent(selectHour);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectMinutes);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectSeconds);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectAMPM);
        fixture.detectChanges();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];

        spyOn(timePicker.onValueChanged, 'emit');

        UIInteractions.simulateClickAndSelectEvent(OkButton);
        tick();
        fixture.detectChanges();

        expect(timePicker.onValueChanged.emit).toHaveBeenCalled();

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        const selectedTime = `${hourValue}:${minuteValue}:${secondsValue} ${aMPMValue}`;

        expect(valueFromInput).toEqual(selectedTime);
    }));

    it('TimePicker UP Down Keyboard navigation', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const secondsColumn: any = dom.query(By.css('.igx-time-picker__secondsList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.nativeElement.focus();
        // move arrows several times with hour column
        let args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        // move arrows several times with minute column
        args = { key: 'ArrowDown', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowUp', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        secondsColumn.nativeElement.focus();
        fixture.detectChanges();

        // move arrows several times with minute column
        args = { key: 'ArrowDown', bubbles: true };
        secondsColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowUp', bubbles: true };
        secondsColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        secondsColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();

        // move arrows several times with ampm column
        args = { key: 'ArrowUp', bubbles: true };
        AMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        AMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        // get time from dialog header
        const timeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            // eslint-disable-next-line max-len
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        args = { key: 'Enter', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        expect(formatedTimeFromPopupHeader).toBe(valueFromInput);
    }));

    it('TimePicker Left Right Keyboard navigation', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        hourColumn.nativeElement.focus();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement, true);
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement, true);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement, true);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement, true);
        fixture.detectChanges();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('23');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement, true);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement, true);
        fixture.detectChanges();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('18');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement, true);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement, true);
        fixture.detectChanges();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('PM');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement, true);
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__secondsList');

        // get time from dialog header
        const timeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('3:23:18 PM');

        UIInteractions.triggerKeyDownEvtUponElem('Escape', document.activeElement, true);
        fixture.detectChanges();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);
    }));

    it('TimePicker Mouse Over', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick(100);
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const secondsColumn: any = dom.query(By.css('.igx-time-picker__secondsList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.triggerEventHandler('focus', {});
        fixture.detectChanges();

        hourColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        minuteColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        secondsColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__secondsList');

        AMPMColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__ampmList');
    }));

    it('TimePicker Mouse Wheel', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const secondsColumn: any = dom.query(By.css('.igx-time-picker__secondsList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        let event = new WheelEvent('wheel', { deltaX: 0, deltaY: 0 });

        // focus hours
        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel up and expect the selected element to be 2
        expect(hourColumn.nativeElement.children[3].innerText).toBe('2');

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel down and expect the selected element to be 3 again
        expect(hourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel up and expect the selected element to be 23
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('23');

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel down and expect the selected element to be 24 again
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus seconds
        secondsColumn.nativeElement.focus();
        fixture.detectChanges();

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
        secondsColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel up and expect the selected element to be 16
        expect(secondsColumn.nativeElement.children[3].innerText).toBe('16');

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        secondsColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel down and expect the selected element to be 17 again
        expect(secondsColumn.nativeElement.children[3].innerText).toBe('17');

        // focus ampm
        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel down and expect the selected element to be PM
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel up and expect the selected element to be AM again
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker Pan Move', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const secondsColumn: any = dom.query(By.css('.igx-time-picker__secondsList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        // panmove is in reverse direction of mouse wheel
        const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 0 });
        const eventUp = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        const eventDown = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });

        // focus hours
        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('panmove', event);
        fixture.detectChanges();

        hourColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();

        // swipe up and expect the selected element to be 4
        expect(hourColumn.nativeElement.children[3].innerText).toBe('4');

        hourColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();

        // swipe down and expect the selected element to be 3 again
        expect(hourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();

        // swipe up and expect the selected element to be 25
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('25');

        minuteColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();

        // swipe down and expect the selected element to be 24 again
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus minutes
        secondsColumn.nativeElement.focus();
        fixture.detectChanges();

        secondsColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();

        // swipe up and expect the selected element to be 18
        expect(secondsColumn.nativeElement.children[3].innerText).toBe('18');

        secondsColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();

        // swipe down and expect the selected element to be 17 again
        expect(secondsColumn.nativeElement.children[3].innerText).toBe('17');

        // focus ampm
        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();

        // swipe up and expect the selected element to be PM
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        AMPMColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();

        // move the swipe up and expect the selected element to be AM again
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker 24 hour format', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWith24HTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[3];
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        expect(AMPMColumn).toBeNull();
        expect(selectHour.nativeElement.innerText).toBe('00');
    }));

    it('TimePicker Items in view', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithAMPMLeadingZerosTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hoursInview = timePicker.hoursInView();
        const minutesInview = timePicker.minutesInView();
        const secondsInview = timePicker.minutesInView();
        const AMPMInview = timePicker.ampmInView();

        expect(hoursInview).toEqual(['08', '09', '10', '11', '12', '01', '02']);
        expect(minutesInview).toEqual(['24', '25', '26', '27', '28', '29', '30']);
        expect(secondsInview).toEqual(['24', '25', '26', '27', '28', '29', '30']);
        expect(AMPMInview).toEqual(['AM', 'PM']);
    }));

    it('TimePicker scroll to end', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithSpinLoopFalseValueComponent);
        fixture.detectChanges();

        const initialTime = fixture.componentInstance.dateValue;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const secondsColumn: any = dom.query(By.css('.igx-time-picker__secondsList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        spyOn(console, 'error');

        const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });

        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        secondsColumn.nativeElement.focus();
        fixture.detectChanges();

        secondsColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // check console for error
        expect(console.error).not.toHaveBeenCalled();

        const formatedHours = initialTime.getHours() < 10 ? '0' + initialTime.getHours() : initialTime.getHours();
        const formatedMinutes = initialTime.getMinutes() < 10 ? '0' + initialTime.getMinutes() : initialTime.getMinutes();
        const formatedSeconds = initialTime.getSeconds() < 10 ? '0' + initialTime.getSeconds() : initialTime.getSeconds();

        const formatedTestElementTime =
            `${formatedHours}:${formatedMinutes}:${formatedSeconds} ${initialTime.getHours() >= 12 ? 'PM' : 'AM'}`;

        // get time from dialog header
        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        expect(formatedTestElementTime).toBe(formatedTimeFromPopupHeader);
    }));

    it('TimePicker check isSpinLoop with Items Delta', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithItemsDeltaValueComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const secondsColumn: any = dom.query(By.css('.igx-time-picker__secondsList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });

        spyOn(console, 'error');

        // check scrolling each element
        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        secondsColumn.nativeElement.focus();
        fixture.detectChanges();

        secondsColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('12:58:13 PM');

        expect(console.error).not.toHaveBeenCalled();
    }));

    it('TimePicker with not valid element arrow up', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const validDate = new Date(2017, 7, 7, 4, 27);
        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;

        timePicker.value = validDate;

        const notValidHour = '700';
        timePicker.selectedHour = notValidHour;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));

        const args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        expect(hourColumn.nativeElement.children[3].innerText).toEqual('03');
    }));

    it('TimePicker with not valid element arrow down', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;
        const validDate = new Date(2017, 7, 7, 4, 27);

        timePicker.value = validDate;

        const notValidValue = '700';
        timePicker.selectedMinute = notValidValue;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const args = { key: 'ArrowDown', bubbles: true };

        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        expect(minuteColumn.nativeElement.children[3].innerText).toEqual('28');
    }));

    it('TimePicker vertical', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;

        fixture.componentInstance.timePicker.vertical = true;
        fixture.detectChanges();

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const timePickerVertical = dom.query(By.css('.igx-time-picker--vertical'));

        expect(timePickerVertical).not.toBeNull();
        expect(timePickerVertical.nativeElement.offsetWidth).toBeGreaterThan(timePickerVertical.nativeElement.offsetHeight);
    }));

    it('TimePicker with retemplated input group (icon removed)', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerRetemplatedComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const inputGroup = dom.query(By.css('.igx-input-group'));
        expect(inputGroup).not.toBeNull();
        expect(dom.query(By.css('.igx-icon'))).toBeNull();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);
    }));

    // https://github.com/IgniteUI/igniteui-angular/issues/2470
    it('TimePicker always use date from value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const initialValue = (fixture.componentInstance.timePicker.value);
        const initialDate = getDateStringFromDateObject(initialValue);
        const initialTime = initialValue.getHours() + ':' + initialValue.getMinutes();
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[5];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[2];

        UIInteractions.simulateClickAndSelectEvent(selectHour);
        fixture.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(selectMinutes);
        fixture.detectChanges();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];

        UIInteractions.simulateClickAndSelectEvent(OkButton);
        tick();
        fixture.detectChanges();

        const changedValue = (fixture.componentInstance.timePicker.value);
        const changedDate = getDateStringFromDateObject(changedValue);
        const changedTime = changedValue.getHours() + ':' + changedValue.getMinutes();

        expect(initialDate).toEqual(changedDate);
        expect(initialTime).not.toEqual(changedTime);
        expect(changedTime).toEqual('5:23');
    }));

    it('TimePicker default selected value in dialog', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[3];

        expect(selectHour.nativeElement.innerText).toBe('04');

        const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinute = minuteColumn.children[3];

        expect(selectMinute.nativeElement.innerText).toBe('00');

        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = AMPMColumn.children[3];

        expect(selectAMPM.nativeElement.innerText).toBe('AM');
    }));

    it('should be able to apply different formats (dropdown mode)', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerDropDownSingleHourComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.directive(IgxInputDirective));

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('04:05');

        input.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('4:5');

        fixture.componentInstance.timePicker.format = 'h:m tt';
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('4:5 AM');

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('04:05 AM');

        input.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('4:5 AM');
    }));

    it('should correct spin (arrow buttons) on empty value (dropdown mode)', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerDropDownNoValueComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.directive(IgxInputDirective));

        expect(input.nativeElement.value).toBe('', 'Initial focus AM failed');

        // press arrow down
        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('--:-- AM', 'Initial focus AM failed');

        // test hours
        input.nativeElement.setSelectionRange(1, 1);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
        tick(100);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
        tick(100);
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('01:00 AM', 'Hours spin failed');

        // test minutes
        input.nativeElement.setSelectionRange(3, 3);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('01:59 AM', 'MouseWheel Down on minutes failed');
    }));

    describe('EditorProvider', () => {
        it('Should return correct edit element', () => {
            const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.timePicker;
            const editElement = fixture.debugElement.query(By.css('input[igxInput]')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });

    describe('DropDown Mode', () => {
        // configureTestSuite();
        let fixture;
        let timePicker;
        let dom;
        let input;
        beforeEach(
            waitForAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerDropDownComponent);
                fixture.detectChanges();

                timePicker = fixture.componentInstance.timePicker;
                dom = fixture.debugElement;
                input = dom.query(By.directive(IgxInputDirective));
            })
        );

        afterEach(waitForAsync(() => {
            UIInteractions.clearOverlay();
        }));

        it('should initialize a timePicker with dropdown', () => {
            expect(timePicker).toBeDefined();
        });

        it('should accept specific time in the input', (() => {
            fixture.detectChanges();
            const customValue = '12:01 AM';

            spyOn(timePicker.onValueChanged, 'emit');

            UIInteractions.clickAndSendInputElementValue(input, customValue);
            fixture.detectChanges();

            expect(timePicker.onValueChanged.emit).toHaveBeenCalled();
            expect(input.nativeElement.value).toEqual(customValue);
        }));

        it('should increase and decrease hours/minutes/AMPM, where the caret is, using arrows and mousewheel', fakeAsync(() => {
            fixture.detectChanges();

            // initial input value is 05:45 PM
            input.nativeElement.value = '05:45 PM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };

            // focus the input, position the caret at the hours
            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(1, 1);

            // press arrow down
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('04:45 PM', 'ArrowDown on hours failed');

            // mousewheel up
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -10);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 PM', 'MouseWheel Up on hours dailed');

            // test minutes
            // position caret at the minutes and mousewheel down
            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 10);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:44 PM', 'MouseWheel Down on minutes failed');

            // press arrow up
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 PM', 'ArrowUp on minutes failed');

            // test AMPM
            // position caret at AMPM and arrow down
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 AM', 'ArrowDown on AMPM failed');

            // mousewheel up
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -10);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 PM', 'MouseWheel Up on AMPM failed');

            // test full hours
            input.nativeElement.setSelectionRange(0, 0);
            tick(100);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('06:45 PM', 'MouseWheel Up on AMPM failed');
        }));

        it('should open the dropdown when click on the clock icon', fakeAsync(() => {
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            const dropDown = dom.query(By.css('.igx-time-picker--dropdown'));
            expect(dropDown.properties.hidden).toBeFalsy();
        }));

        it('should reset value on clear button click', (() => {
            fixture.detectChanges();

            const clearTime = dom.queryAll(By.css('.igx-icon'))[1];

            UIInteractions.simulateClickAndSelectEvent(clearTime);
            fixture.detectChanges();

            expect(input.nativeElement.innerText).toEqual('');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(input.nativeElement.placeholder).toBe('hh:mm tt');
        }));

        it('should break on spinloop with min and max value on arrow down', (() => {
            fixture.detectChanges();

            const customValue = '07:07 AM';

            UIInteractions.clickAndSendInputElementValue(input, customValue);
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            timePicker.isSpinLoop = false;
            timePicker.minValue = customValue;
            timePicker.maxValue = '08:07 AM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);
            fixture.detectChanges();

            // spin hours
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on hours');

            input.nativeElement.setSelectionRange(5, 5);
            fixture.detectChanges();

            // spin minutes
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on minutes');
        }));

        it('should break on spinloop with min and max value on arrow up', (() => {
            fixture.detectChanges();

            const customValue = '08:07 AM';

            UIInteractions.clickAndSendInputElementValue(input, customValue);
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            timePicker.isSpinLoop = false;
            timePicker.minValue = '07:07 AM';
            timePicker.maxValue = customValue;
            timePicker.itemsDelta = { hours: 1, minutes: 1 };
            fixture.detectChanges();

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(2, 2);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on hours');

            input.nativeElement.setSelectionRange(5, 5);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on minutes');

            input.nativeElement.setSelectionRange(7, 7);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on AMPM');
        }));

        it('should spinloop on correct time after max or min values', fakeAsync(() => {
            fixture.detectChanges();

            const customValue = '08:05 AM';

            UIInteractions.setInputElementValue(input, customValue);
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            timePicker.isSpinLoop = true;
            timePicker.minValue = '08:05 AM';
            timePicker.maxValue = '11:07 AM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };
            fixture.detectChanges();

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(1, 1);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('11:05 AM', 'SpinLoop Down wrong time');

            // set a new value which is the max value
            input.nativeElement.focus();
            UIInteractions.setInputElementValue(input, '11:03 AM');
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            // should skip one hour because of the minutes
            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(2, 2);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('09:03 AM', 'SpinLoop Up wrong time');
        }));

        it('should open the dropdown with Alt + arrow down', fakeAsync(() => {
            fixture.detectChanges();
            const dropDown = dom.query(By.css('.igx-time-picker--dropdown'));

            // should open dropdown on alt + arrow down
            input.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }));
            tick();
            fixture.detectChanges();

            expect(dropDown.properties.hidden).toBeFalsy();
        }));

        it('should open the dropdown with SpaceBar', fakeAsync(() => {
            fixture.detectChanges();
            const dropDown = dom.query(By.css('.igx-time-picker--dropdown'));

            // should open dropdown on alt + arrow down
            UIInteractions.triggerKeyDownEvtUponElem('SpaceBar', input.nativeElement, true);
            tick();
            fixture.detectChanges();

            expect(dropDown.properties.hidden).toBeFalsy();
        }));

        it('should prevent interaction when disabled', (() => {
            fixture.detectChanges();

            let styles = window.getComputedStyle(input.nativeElement);
            // normal text color
            expect(styles.color).toBe('rgba(0, 0, 0, 0.87)');

            timePicker.disabled = true;
            fixture.detectChanges();

            styles = window.getComputedStyle(input.nativeElement);

            // disabled text color
            expect(styles.color).toBe('rgba(0, 0, 0, 0.38)');
            expect(dom.query(By.css('.igx-input-group--disabled'))).toBeDefined();
        }));

        it('should trigger onValidationFailed event when setting invalid time.', (() => {
            fixture.detectChanges();

            UIInteractions.clickAndSendInputElementValue(input, '77:77 TT');

            spyOn(timePicker.onValidationFailed, 'emit');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();
        }));

        it('should trigger onValueChanged if 00:00 is cleared from the input', () => {
            fixture.componentInstance.date = new Date(2018, 10, 27, 0, 0, 0, 0);
            fixture.detectChanges();
            spyOn(timePicker.onValueChanged, 'emit');
            timePicker.clear();
            fixture.detectChanges();
            expect(timePicker.onValueChanged.emit).toHaveBeenCalledTimes(1);
        });

        it('should scroll on dropdown opened and accept value when focus lost', fakeAsync(() => {
            fixture.detectChanges();

            timePicker.itemsDelta = { hours: 1, minutes: 5 };

            const initVal = fixture.componentInstance.date;
            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));

            UIInteractions.simulateWheelEvent(hourColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            let childCount = hourColumn.children.length;
            expect(hourColumn.children[0].nativeElement.innerText).toBe('01');
            expect(hourColumn.children[childCount - 1].nativeElement.innerText).toBe('07');

            UIInteractions.simulateWheelEvent(minuteColumn.nativeElement, 0, 10);
            fixture.detectChanges();

            childCount = minuteColumn.children.length;
            expect(minuteColumn.children[0].nativeElement.innerText).toBe('35');
            expect(minuteColumn.children[childCount - 1].nativeElement.innerText).toBe('05');

            UIInteractions.simulateWheelEvent(AMPMColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            const AMIndicator = AMPMColumn.children.find(item => item.nativeElement.innerText === 'AM');
            const PMIndicator = AMPMColumn.children.find(item => item.nativeElement.innerText === 'PM');
            expect(AMIndicator).not.toBeUndefined();
            expect(PMIndicator).not.toBeUndefined();

            // expect input value to be changed
            expect(input.nativeElement.value).toBe('04:50 AM');
            // expect the timePicker date not to be changed
            expect(fixture.componentInstance.date).toBe(initVal);

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(fixture.componentInstance.date).toEqual(new Date(2018, 10, 27, 4, 50, 0, 0));
        }));

        it('should not accept invalid value from dropdown when min is set', fakeAsync(() => {
            fixture.detectChanges();

            timePicker.isSpinLoop = true;
            timePicker.minValue = '05:45 PM';
            timePicker.maxValue = '06:45 PM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };

            const initVal = fixture.componentInstance.date;
            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));

            UIInteractions.simulateWheelEvent(hourColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            UIInteractions.simulateWheelEvent(minuteColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            UIInteractions.simulateWheelEvent(AMPMColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            spyOn(timePicker.onValidationFailed, 'emit');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();

            // initial value should not be changed
            expect(fixture.componentInstance.date).toEqual(initVal);
        }));

        it('should be able to change the mode at runtime', fakeAsync(() => {
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            expect(dom.query(By.css('.igx-time-picker--dropdown'))).toBeDefined();

            fixture.componentInstance.timePicker.mode = InteractionMode.Dialog;
            fixture.detectChanges();

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            expect(dom.query(By.css('.igx-time-picker--dropdown'))).toBeNull();
        }));

        it('should fire events onOpened and onClosed for dropdown mode.', fakeAsync(() => {
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            spyOn(timePicker.onOpened, 'emit');

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            expect(timePicker.onOpened.emit).toHaveBeenCalled();

            spyOn(timePicker.onClosed, 'emit');

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            expect(timePicker.onOpened.emit).toHaveBeenCalled();
        }));

        it('should display OK and Cancel buttons by default.', fakeAsync(() => {
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            const buttons = document.getElementsByClassName('igx-time-picker__buttons')[0];
            expect(buttons.children.length).toEqual(2);

            const cancelBtn = buttons.children[0] as HTMLElement;
            const okBtn = buttons.children[1] as HTMLElement;

            expect(cancelBtn.innerText).toBe('Cancel');
            expect(okBtn.innerText).toBe('OK');

            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });

            minuteColumn.nativeElement.dispatchEvent(keydownEvent);
            fixture.detectChanges();

            expect(minuteColumn.nativeElement.children[3].innerText).toEqual('50');

            cancelBtn.click();
            tick();
            fixture.detectChanges();

            const inputGroup = dom.query(By.directive(IgxInputDirective));
            expect(inputGroup.nativeElement.value).toEqual('05:45 PM');

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            minuteColumn.nativeElement.dispatchEvent(keydownEvent);
            fixture.detectChanges();

            okBtn.click();
            tick();
            fixture.detectChanges();

            expect(inputGroup.nativeElement.value).toEqual('05:50 PM');

            timePicker.okButtonLabel = '';
            timePicker.cancelButtonLabel = '';

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            expect(document.getElementsByClassName('igx-time-picker__buttons').length).toEqual(0);
        }));

        it('should focus input on user interaction with OK btn, Cancel btn, Enter Key, Escape key', fakeAsync(() => {
            fixture.detectChanges();
            let overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle.length).toEqual(0);

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];
            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            const buttons = document.getElementsByClassName('igx-time-picker__buttons')[0];
            expect(buttons.children.length).toEqual(2);

            const okBtn = dom.queryAll(By.css('.igx-button--flat'))[1];
            expect(okBtn.nativeElement.innerText).toBe('OK');

            // OK btn
            okBtn.triggerEventHandler('click', {});
            tick();
            fixture.detectChanges();

            input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);

            // Cancel btn
            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();
            const cancelBtn = dom.queryAll(By.css('.igx-button--flat'))[0];
            expect(cancelBtn.nativeElement.innerText).toBe('Cancel');
            cancelBtn.triggerEventHandler('click', {});
            tick();
            fixture.detectChanges();
            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);

            // Enter key
            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick(100);
            fixture.detectChanges();
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick();
            fixture.detectChanges();
            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);

            // Esc key
            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick(100);
            fixture.detectChanges();
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick();
            fixture.detectChanges();

            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);
        }));

        it('When timepicker is closed via outside click, the focus should NOT remain on the input',
            fakeAsync(() => {
                fixture.detectChanges();
                input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
                let overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');

                expect(overlayToggle.length).toEqual(0);

                const iconTime = dom.queryAll(By.css('.igx-icon'))[0];
                UIInteractions.simulateClickAndSelectEvent(iconTime);
                tick();
                fixture.detectChanges();

                overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
                expect(overlayToggle[0]).not.toBeNull();
                expect(overlayToggle[0]).not.toBeUndefined();

                const dummyInput = fixture.componentInstance.dummyInput.nativeElement;
                dummyInput.focus();
                dummyInput.click();
                tick();
                fixture.detectChanges();

                overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
                input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
                expect(overlayToggle[0]).toEqual(undefined);
                expect(input).not.toEqual(document.activeElement);
                expect(dummyInput).toEqual(document.activeElement);
            }));

        it('should apply disabled style for time outside the min and max values', fakeAsync(() => {
            timePicker = new IgxTimePickerComponent(null, null);
            fixture.detectChanges();
            timePicker.format = 'hh:mm:ss tt';
            const date = new Date(2018, 10, 27, 9, 50, 58);
            timePicker.value = date;

            timePicker.minValue = '09:15:10 AM';
            timePicker.maxValue = '11:15:10 AM';

            timePicker.selectedHour = '06';
            timePicker.selectedMinute = '25';
            timePicker.selectedSeconds = '00';
            timePicker.selectedAmPm = 'AM';

            fixture.detectChanges();

            // The selected time is 06:25:00 AM
            // Testing 09:25:00 AM
            expect(timePicker.applyDisabledStyleForItem('hour', '9')).toBe(false);

            timePicker.selectedHour = '9'; // The selected time is 09:25:00 AM

            // Testing 10:25:00 AM
            expect(timePicker.applyDisabledStyleForItem('hour', '10')).toBe(false);

            timePicker.selectedHour = '10';
            timePicker.selectedMinute = '10'; // The selected time is 10:10:00 AM

            // Testing 11:10:00 AM
            expect(timePicker.applyDisabledStyleForItem('hour', '11')).toBe(false);

            timePicker.selectedHour = '11'; // The selected time is 11:10:00 AM

            // Testing 12:11:00 AM
            expect(timePicker.applyDisabledStyleForItem('hour', '12')).toBe(true);
            // Testing 11:28:00 AM
            expect(timePicker.applyDisabledStyleForItem('minute', '28')).toBe(true);
            // Testing 11:10:28 AM
            expect(timePicker.applyDisabledStyleForItem('seconds', '28')).toBe(false);

            timePicker.selectedAmPm = 'PM'; // The selected time is 11:10:00 PM

            // Testing 11:10:00 AM
            expect(timePicker.applyDisabledStyleForItem('ampm', 'AM')).toBe(false);
        }));
    });

    describe('Timepicker with outlet', () => {
        configureTestSuite();
        let fixture;
        let timePicker;

        it('should display the overlay in the provided outlet', fakeAsync(() => {
            fixture = TestBed.createComponent(IgxTimePickerWithOutletComponent);
            timePicker = fixture.componentInstance.timepicker;
            fixture.detectChanges();
            const dom = fixture.debugElement;

            expect(() => {
                const timePickerTarget = dom.query(By.directive(IgxInputDirective));
                UIInteractions.simulateClickAndSelectEvent(timePickerTarget);
                tick();
                fixture.detectChanges();
            }).not.toThrowError();

            expect(timePicker.outlet).toBeDefined();
        }));
    });

    describe('TimePicker retemplating and customization', () => {
        configureTestSuite();
        let fixture;
        let dom;

        beforeEach(
            waitForAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerRetemplatedDropDownComponent);
                fixture.detectChanges();

                dom = fixture.debugElement;
            })
        );

        afterEach(waitForAsync(() => {
            UIInteractions.clearOverlay();
        }));


        it('TimePicker with retemplated input group and dropDownTarget ref variable', fakeAsync(() => {
            const icon = dom.query(By.css('.igx-icon'));
            const inputGroup = dom.query(By.css('.igx-input-group'));

            expect(inputGroup).not.toBeNull();
            expect(icon).not.toBeNull();

            expect(() => {
                UIInteractions.simulateClickAndSelectEvent(icon);
                tick();
                fixture.detectChanges();
            }).not.toThrowError();

            const dropDown = dom.query(By.css('.igx-time-picker--dropdown'));
            expect(dropDown.properties.hidden).toBeFalsy();

            const dropdownClientRect = dropDown.nativeElement.getBoundingClientRect();
            const inputGroupClientRect = inputGroup.nativeElement.getBoundingClientRect();

            expect(dropdownClientRect.top).toEqual(inputGroupClientRect.bottom);
            expect(dropdownClientRect.left).toEqual(inputGroupClientRect.left);
        }));

        it('should be able to add custom buttons.', fakeAsync(() => {
            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            const buttons = document.getElementsByClassName('test')[0];
            expect(buttons.children.length).toEqual(1);

            const customBtn = buttons.children[0] as HTMLElement;
            expect(customBtn.innerText).toBe('SELECT');

            customBtn.click();
            tick();
            fixture.detectChanges();

            const input = dom.query(By.directive(IgxInputDirective));
            expect(input.nativeElement.value).toEqual('10:45 AM');
        }));
    });

    describe('Hour/minute only mode', () => {
        configureTestSuite();
        let fixture: ComponentFixture<IgxTimePickerDropDownSingleHourComponent>;
            let timePicker: IgxTimePickerComponent;
            let dom: DebugElement;
            let input: DebugElement;

        beforeEach(
            waitForAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerDropDownSingleHourComponent);
                fixture.detectChanges();

                timePicker = fixture.componentInstance.timePicker;
                dom = fixture.debugElement;
                input = dom.query(By.directive(IgxInputDirective));
            })
        );

        afterEach(waitForAsync(() => {
            UIInteractions.clearOverlay();
        }));

        it('Should render dropdown and input group correctly when format contains only hours.', fakeAsync(() => {
            fixture.componentInstance.format = 'hh tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const ampmColumn = dom.query(By.css('.igx-time-picker__ampmList'));

            expect(hourColumn).not.toBeNull();
            expect(ampmColumn).not.toBeNull();
            expect(minuteColumn).toBeNull();
        }));

        it('Should mask editable input correctly when format contains only hours.', fakeAsync(() => {
            fixture.componentInstance.format = 'hh tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();
            const clearTime = dom.queryAll(By.css('.igx-icon'))[1];

            UIInteractions.simulateClickAndSelectEvent(clearTime);
            fixture.detectChanges();
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(input.nativeElement.value).toEqual('');
            expect(input.nativeElement.placeholder).toEqual('hh tt');

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('-- AM');
        }));

        it('should allow editing of input after clear', fakeAsync(() => {
            fixture.componentInstance.format = 'hh tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();
            spyOn(fixture.componentInstance.timePicker, 'onInput');

            const clearTime = dom.queryAll(By.css('.igx-icon'))[1];
            UIInteractions.simulateClickAndSelectEvent(clearTime);
            fixture.detectChanges();
            const _input = fixture.debugElement.query(By.css('input'));
            UIInteractions.simulateTyping('12 AM', _input);
            expect(fixture.componentInstance.timePicker.onInput).not.toThrow();
            expect(_input.nativeElement.value).toEqual('12 AM');
        }));

        it('Should properly switch between AM/PM when typing', () => {
            fixture.componentInstance.format = 'hh tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();

            input.triggerEventHandler('focus', { target: input.nativeElement });
            UIInteractions.simulateTyping('pm', input, 2, 4);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual('05 pm');

            input.triggerEventHandler('blur', { target: input.nativeElement });
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual('05 PM');
        });

        it('Should navigate dropdown lists correctly when format contains only hours.', fakeAsync(() => {
            fixture.componentInstance.format = 'hh tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0);
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            dom.query(By.css('.igx-time-picker__hourList')).nativeElement.focus();
            fixture.detectChanges();

            expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            fixture.detectChanges();

            expect(document.activeElement.classList).toContain('igx-time-picker__ampmList');

            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick();
            fixture.detectChanges();

            expect(input.nativeElement.value).toEqual('04 PM');
            expect(timePicker.value).toEqual(new Date(2018, 10, 27, 16, 45, 0, 0));
        }));

        it('Should navigate dropdown lists correctly when format contains only minutes.', fakeAsync(() => {
            fixture.componentInstance.format = 'mm tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.simulateClickAndSelectEvent(iconTime);
            tick();
            fixture.detectChanges();

            dom.query(By.css('.igx-time-picker__minuteList')).nativeElement.focus();
            fixture.detectChanges();

            expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement, true);
            fixture.detectChanges();

            expect(document.activeElement.classList).toContain('igx-time-picker__ampmList');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement, true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement, true);
            UIInteractions.triggerKeyDownEvtUponElem('Enter', document.activeElement, true);
            tick();
            fixture.detectChanges();

            expect(input.nativeElement.value).toEqual('46 PM');
            expect(timePicker.value).toEqual(new Date(2018, 10, 27, 17, 46, 0, 0));
        }));

        it('Should spin editable input correctly when format contains only hours - 24 hour format.', fakeAsync(() => {
            fixture.componentInstance.format = 'HH';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('17');

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('18');
            expect(timePicker.value).toEqual(new Date(2018, 10, 27, 18, 45, 0, 0));
        }));

        it('Should spin editable input correctly when format contains only minutes.', () => {
            fixture.componentInstance.format = 'mm tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('45 PM');

            input.nativeElement.setSelectionRange(0, 0);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('46 PM');
            expect(timePicker.value).toEqual(new Date(2018, 10, 27, 17, 46, 0, 0));
        });

        it('Should spin editable input AM/PM correctly when format contains only hours.', () => {
            fixture.componentInstance.format = 'hh tt';
            fixture.componentInstance.customDate = new Date(2018, 10, 27, 17, 45, 0, 0);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05 PM');

            input.nativeElement.setSelectionRange(3, 3);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05 AM');
            expect(timePicker.value).toEqual(new Date(2018, 10, 27, 5, 45, 0, 0));
        });

        it('Should render dialog and input group correctly when format contains only minutes.', fakeAsync(() => {
            fixture.componentInstance.format = 'mm';
            fixture.componentInstance.mode = InteractionMode.Dialog;
            fixture.detectChanges();

            input = dom.query(By.directive(IgxInputDirective));
            UIInteractions.simulateClickAndSelectEvent(input);
            fixture.detectChanges();

            const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const ampmColumn = dom.query(By.css('.igx-time-picker__ampmList'));

            expect(hourColumn).toBeNull();
            expect(ampmColumn).toBeNull();
            expect(minuteColumn).not.toBeNull();

            expect(input.nativeElement.value).toEqual('05');
            expect(timePicker.mask).toEqual('00');
            expect(timePicker.value).toEqual(fixture.componentInstance.customDate);

            const headerHour = dom.query(By.css('.igx-time-picker__header-hour'));
            const headerAmPm = dom.query(By.css('.igx-time-picker__header-ampm'));

            expect(headerHour.nativeElement.innerText.replace(/\n/g, '')).toEqual('4:05:0');
            expect(headerAmPm.nativeElement.innerText).toEqual('');
        }));

        it('Should render dialog and input group correctly when format contains only hours.', fakeAsync(() => {
            fixture.componentInstance.format = 'hh tt';
            fixture.componentInstance.mode = InteractionMode.Dialog;
            fixture.detectChanges();

            input = dom.query(By.directive(IgxInputDirective));
            UIInteractions.simulateClickAndSelectEvent(input);
            tick();
            fixture.detectChanges();

            const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const ampmColumn = dom.query(By.css('.igx-time-picker__ampmList'));

            expect(hourColumn).not.toBeNull();
            expect(ampmColumn).not.toBeNull();
            expect(minuteColumn).toBeNull();

            expect(input.nativeElement.value).toEqual('04 AM');
            expect(timePicker.mask).toEqual('00 LL');
            expect(timePicker.value).toEqual(fixture.componentInstance.customDate);

            const headerHour = dom.query(By.css('.igx-time-picker__header-hour'));
            const headerAmPm = dom.query(By.css('.igx-time-picker__header-ampm'));

            expect(headerHour.nativeElement.innerText.replace(/\n/g, '')).toEqual('04:5:0');
            expect(headerAmPm.nativeElement.innerText).toEqual('AM');
        }));
    });

    describe('Reactive form', () => {
        let fixture: ComponentFixture<IgxTimePickerReactiveFormComponent>;
        let timePickerOnChangeComponent: IgxTimePickerComponent;
        let timePickerOnBlurComponent: IgxTimePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxTimePickerReactiveFormComponent);
            timePickerOnChangeComponent = fixture.componentInstance.timePickerOnChangeComponent;
            timePickerOnBlurComponent = fixture.componentInstance.timePickerOnBlurComponent;
            fixture.detectChanges();
        });

        it('Should set time picker status to invalid when it is required and has no value', fakeAsync(() => {
            const inputGroupsElements = fixture.debugElement.queryAll(By.directive(IgxInputDirective));
            const inputGroupElement = inputGroupsElements.find(d => d.componentInstance === timePickerOnChangeComponent);
            const inputDirective = inputGroupElement.injector.get(IgxInputDirective) as IgxInputDirective;

            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            timePickerOnChangeComponent.value = new Date();
            fixture.detectChanges();

            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            timePickerOnChangeComponent.value = null;
            fixture.detectChanges();

            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);
        }));

        it('Should set time picker status to invalid when it is required and has no value onBlur', fakeAsync(() => {
            timePickerOnBlurComponent.mode = InteractionMode.DropDown;
            timePickerOnBlurComponent.mask = 'dd/mm/yyyy';

            fixture.detectChanges();

            const inputDirectiveElements = fixture.debugElement.queryAll(By.directive(IgxInputDirective));
            const inputDirectiveElement = inputDirectiveElements.find(d => d.componentInstance === timePickerOnBlurComponent);
            const inputDirective = inputDirectiveElement.injector.get(IgxInputDirective) as IgxInputDirective;

            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            inputDirectiveElement.triggerEventHandler('focus', { target: { value: null } });
            tick(16);
            fixture.detectChanges();

            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            timePickerOnBlurComponent.value = new Date();
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            timePickerOnBlurComponent.value = null;
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            inputDirectiveElement.triggerEventHandler('blur', { target: { value: null } });
            fixture.detectChanges();

            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);
        }));

        // Bug #6025 Date picker does not disable in reactive form
        it('Should disable when form is disabled', fakeAsync(() => {
            const formGroup: FormGroup = fixture.componentInstance.reactiveForm;
            const inputGroupsElements = fixture.debugElement.queryAll(By.directive(IgxInputDirective));
            const inputGroupElement = inputGroupsElements.find(d => d.componentInstance === timePickerOnBlurComponent);
            const inputDirective = inputGroupElement.injector.get(IgxInputDirective) as IgxInputDirective;
            expect(inputDirective.disabled).toBeFalsy();

            formGroup.disable();
            fixture.detectChanges();
            expect(inputDirective.disabled).toBeTruthy();
        }));
    });

    describe('Control value accessor unit tests', () => {
        let ngModel;
        let element;
        let cdr;
        let toggleRef;
        let injector;
        let inputGroup: IgxInputGroupComponent;
        let renderer2;

        beforeEach(() => {
            ngModel = {
                control: { touched: false, dirty: false, validator: null },
                valid: false,
                statusChanges: new EventEmitter(),
            };
            element = {
                nativeElement: { getBoundingClientRect: () => 0 },
                style: { width: null }
            };
            cdr = { detectChanges: () => { } };
            toggleRef = {
                onOpened: new EventEmitter<any>(),
                onClosed: new EventEmitter<any>(),
                onClosing: new EventEmitter<IBaseCancelableBrowserEventArgs>(),
                element
            };
            renderer2 = { setAttribute: () => { } };
            spyOn(renderer2, 'setAttribute').and.callFake(() => {});
            injector = { get: () => ngModel };
            inputGroup = new IgxInputGroupComponent(element, null, null, document, renderer2);
        });

        it('should initialize time picker with required correctly', () => {
            const timePicker = new IgxTimePickerComponent(injector, cdr);
            timePicker['_inputGroup'] = inputGroup;
            timePicker['toggleRef'] = toggleRef;
            ngModel.control.validator = () => ({ required: true });
            timePicker.ngOnInit();
            timePicker.ngAfterViewInit();
            timePicker.ngAfterViewChecked();

            expect(timePicker).toBeDefined();
            expect(inputGroup.isRequired).toBeTruthy();
        });

        it('should update inputGroup isRequired correctly', () => {
            const timePicker = new IgxTimePickerComponent(injector, cdr);
            timePicker['_inputGroup'] = inputGroup;
            timePicker['toggleRef'] = toggleRef;
            timePicker.ngOnInit();
            timePicker.ngAfterViewInit();
            timePicker.ngAfterViewChecked();

            expect(timePicker).toBeDefined();
            expect(inputGroup.isRequired).toBeFalsy();

            ngModel.control.validator = () => ({ required: true });
            ngModel.statusChanges.emit();
            expect(inputGroup.isRequired).toBeTruthy();

            ngModel.control.validator = () => ({ required: false });
            ngModel.statusChanges.emit();
            expect(inputGroup.isRequired).toBeFalsy();
        });
    });
});

@Component({
    template: `
        <igx-time-picker [format]="'hh:mm:ss tt'" [vertical]="isVertical"></igx-time-picker>
    `
})
export class IgxTimePickerTestComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public isVertical = false;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPassedTimeComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public dateValue: Date = new Date(2017, 7, 7, 3, 24, 17);
    public customFormat = 'h:mm:ss tt';
}

@Component({
    template: `
        <igx-time-picker [mode]="mode" [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPmTimeComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public dateValue: Date = new Date(2017, 7, 7, 12, 27, 23);
    public customFormat = 'h:mm:ss tt';
    public mode = 'dialog';
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithAMPMLeadingZerosTimeComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public dateValue: Date = new Date(2017, 7, 7, 23, 27);
    public customFormat = 'hh:mm tt';
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWith24HTimeComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public dateValue: Date = new Date(2017, 7, 7, 24, 27);
    public customFormat = 'HH:mm';
}

@Component({
    template: `
        <igx-time-picker [minValue]="myMinValue" [maxValue]="myMaxValue"
         [value]="dateValue" [format]="'h:mm:ss tt'"></igx-time-picker>
    `
})
export class IgxTimePickerWithMInMaxTimeValueComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public dateValue: Date = new Date(2017, 7, 7, 4, 27, 13);
    public myMinValue = '3:24:11 AM';
    public myMaxValue = '5:24:28 AM';
}

@Component({
    template: `
        <igx-time-picker [isSpinLoop]=false
         [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithSpinLoopFalseValueComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public dateValue: Date = new Date(2017, 7, 7, 1, 0, 0);
    public customFormat = 'hh:mm:ss tt';
    public customitemsDelta: any = { hours: 2, minutes: 2, seconds: 3 };
}

@Component({
    template: `
        <igx-time-picker [isSpinLoop]=false
         [value]="dateValue" [format]="customFormat" [itemsDelta]="customitemsDelta"></igx-time-picker>
    `
})
export class IgxTimePickerWithItemsDeltaValueComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public dateValue: Date = new Date(2017, 7, 7, 10, 56, 12);
    public customFormat = 'hh:mm:ss tt';
    public customitemsDelta: any = { hours: 2, minutes: 2, seconds: 1 };
}

@Component({
    template: `
<igx-time-picker>
    <ng-template igxTimePickerTemplate let-displayTime="displayTime">
        <igx-input-group>
            <label igxLabel>Time</label>
            <input igxInput [value]="displayTime" required/>
        </igx-input-group>
    </ng-template>
</igx-time-picker>
    `
})
export class IgxTimePickerRetemplatedComponent { }

@Component({
    template: `
    <igx-time-picker [mode]="mode">
        <label igxLabel *ngIf="customLabel">Custom label</label>
    </igx-time-picker>
    `
})
export class IgxTimePickerCustomLabelComponent {
    public customLabel = true;
    public mode = InteractionMode.DropDown;
}


@Component({
    template: `
    <input class="dummyInput" #dummyInput/>
    <igx-time-picker mode="dropdown"
            [isSpinLoop]="isSpinLoop"
            [(ngModel)]="date"
            [itemsDelta]="itemsDelta"
            [format]="format" >
    </igx-time-picker>
    `
})
export class IgxTimePickerDropDownComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    @ViewChild('dummyInput') public dummyInput: ElementRef;
    public itemsDelta = { hours: 1, minutes: 5, seconds: 1 };
    public format = 'hh:mm tt';
    public isSpinLoop = true;
    public isVertical = true;
    public date = new Date(2018, 10, 27, 17, 45, 0, 0);
}
@Component({
    template: `
    <igx-time-picker
         [value]="customDate"
         [mode]="mode"
         [format]="format">
    </igx-time-picker>
    `
})
export class IgxTimePickerDropDownSingleHourComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public customDate = new Date(2018, 10, 27, 4, 5);
    public mode = InteractionMode.DropDown;
    public format = 'H:m';
}
@Component({
    template: `
    <igx-time-picker
        [mode]="mode"
        [format]="'hh:mm tt'">
    </igx-time-picker>
    `
})
export class IgxTimePickerDropDownNoValueComponent {
    @ViewChild(IgxTimePickerComponent, { static: true }) public timePicker: IgxTimePickerComponent;
    public mode = InteractionMode.DropDown;
}


@Component({
    template: `
<igx-time-picker #picker [mode]="'dropdown'">
    <ng-template igxTimePickerTemplate let-openDialog="openDialog" let-displayTime="displayTime">
        <igx-input-group #dropDownTarget>
            <label igxLabel>Time</label>
            <input igxInput [value]="displayTime" required/>
            <igx-suffix>
                <igx-icon class="date-picker-icon" (click)="openDialog(dropDownTarget.element.nativeElement)">access_alarm</igx-icon>
            </igx-suffix>
        </igx-input-group>
    </ng-template>
    <ng-template igxTimePickerActions>
        <div class="test">
            <button igxButton="flat" (click)="select(picker)">SELECT</button>
        </div>
    </ng-template>
</igx-time-picker>
    `
})
export class IgxTimePickerRetemplatedDropDownComponent {
    public select(picker: IgxTimePickerComponent) {
        picker.value = new Date(2018, 10, 27, 10, 45, 0, 0);
        picker.close();
    }
}

@Component({
    template: `
        <igx-time-picker [outlet]="outlet" #timepicker></igx-time-picker>
        <div igxOverlayOutlet #outlet="overlay-outlet"></div>
    `
})
export class IgxTimePickerWithOutletComponent {
    @ViewChild('timepicker', { static: true }) public timepicker: IgxTimePickerComponent;
}

@Component({
    template: `
    <form [formGroup]="reactiveForm">
        <igx-time-picker formControlName="timePickerOnChange" #timePickerOnChange></igx-time-picker>
        <igx-time-picker formControlName="timePickerOnBlur" #timePickerOnBlur></igx-time-picker>
</form>
`
})
export class IgxTimePickerReactiveFormComponent {
    @ViewChild('timePickerOnChange', { read: IgxTimePickerComponent, static: true })
    public timePickerOnChangeComponent: IgxTimePickerComponent;

    @ViewChild('timePickerOnBlur', { read: IgxTimePickerComponent, static: true })
    public timePickerOnBlurComponent: IgxTimePickerComponent;

    public reactiveForm: FormGroup;

    constructor(fb: FormBuilder) {
        this.reactiveForm = fb.group({
            timePickerOnChange: [null, Validators.required],
            timePickerOnBlur: [null, { updateOn: 'blur', validators: Validators.required }]
        });
    }
    public onSubmitReactive() { }
}

@NgModule({
    declarations: [
        IgxTimePickerTestComponent,
        IgxTimePickerWithPassedTimeComponent,
        IgxTimePickerWithPmTimeComponent,
        IgxTimePickerWithMInMaxTimeValueComponent,
        IgxTimePickerWith24HTimeComponent,
        IgxTimePickerWithAMPMLeadingZerosTimeComponent,
        IgxTimePickerWithSpinLoopFalseValueComponent,
        IgxTimePickerWithItemsDeltaValueComponent,
        IgxTimePickerRetemplatedComponent,
        IgxTimePickerDropDownComponent,
        IgxTimePickerDropDownSingleHourComponent,
        IgxTimePickerDropDownNoValueComponent,
        IgxTimePickerRetemplatedDropDownComponent,
        IgxTimePickerWithOutletComponent,
        IgxTimePickerReactiveFormComponent,
        IgxTimePickerCustomLabelComponent
    ],
    imports: [
        IgxTimePickerModule,
        FormsModule,
        NoopAnimationsModule,
        IgxInputGroupModule,
        IgxIconModule,
        IgxToggleModule,
        ReactiveFormsModule
    ]
})
export class IgxTimePickerTestingModule { }

// helper functions
const findByInnerText = (collection, searchText) => {
    for (const element of collection) {
        if (element.nativeElement.innerText === searchText) {
            return element;
        }
    }
};

const getDateStringFromDateObject = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    return year + '/' + month + '/' + day;
};
