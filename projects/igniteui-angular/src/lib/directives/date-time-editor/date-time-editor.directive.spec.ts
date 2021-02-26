import { IgxDateTimeEditorDirective, IgxDateTimeEditorModule } from './date-time-editor.directive';
import { DatePart } from './date-time-editor.common';
import { DOCUMENT } from '@angular/common';
import { Component, ViewChild, DebugElement, EventEmitter, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, FormGroup, FormBuilder, ReactiveFormsModule, Validators, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputGroupModule, IgxInputGroupComponent, IgxInputDirective } from '../../input-group/public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

describe('IgxDateTimeEditor', () => {
    let dateTimeEditor: IgxDateTimeEditorDirective;
    describe('Unit tests', () => {
        const maskParsingService = jasmine.createSpyObj('MaskParsingService',
            ['parseMask', 'restoreValueFromMask', 'parseMaskValue', 'applyMask']);
        const renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute']);
        const locale = 'en';
        const ngModel = {
            control: { touched: false, dirty: false, validator: null, setValue: (value: any) => { } },
            valid: false,
            statusChanges: new EventEmitter(),
        };
        let elementRef = { nativeElement: null };
        let inputFormat: string;
        let inputDate: string;
        const initializeDateTimeEditor = (control?: NgControl) => {
            // const injector = { get: () => control };
            dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, locale);
            dateTimeEditor.inputFormat = inputFormat;
            dateTimeEditor.ngOnInit();

            const change: SimpleChange = new SimpleChange(undefined, inputFormat, true);
            const changes: SimpleChanges = { inputFormat: change };
            dateTimeEditor.ngOnChanges(changes);
        };
        describe('Properties & Events', () => {
           it('should emit valueChange event on clear()', () => {
                inputFormat = 'dd/M/yy';
                inputDate = '6/6/2000';
                elementRef = { nativeElement: { value: inputDate, setSelectionRange: () => {} } };
                initializeDateTimeEditor();

                const date = new Date(2000, 5, 6);
                dateTimeEditor.value = date;
                spyOn(dateTimeEditor.valueChange, 'emit');
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.clear();
                expect(dateTimeEditor.value).toBeNull();
                expect(dateTimeEditor.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditor.valueChange.emit).toHaveBeenCalledWith(null);
            });

            it('should update mask according to the input format', () => {
                inputFormat = 'd/M/yy';
                inputDate = '';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.inputFormat = inputFormat;
                expect(dateTimeEditor.mask).toEqual('0/0/00');

                dateTimeEditor.inputFormat = 'dd-MM-yyyy HH:mm:ss';
                expect(dateTimeEditor.mask).toEqual('00-00-0000 00:00:00');

                dateTimeEditor.inputFormat = 'H:m:s';
                expect(dateTimeEditor.mask).toEqual('0:0:0');
            });
        });

        describe('Date portions spinning', () => {
            it('should correctly increment / decrement date portions with passed in DatePart', () => {
                inputFormat = 'dd/M/yy';
                inputDate = '12/10/2015';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2015, 11, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);
                const date = dateTimeEditor.value.getDate();
                const month = dateTimeEditor.value.getMonth();

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toBeGreaterThan(date);

                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toBeLessThan(month);
            });

            it('should correctly increment / decrement date portions without passed in DatePart', () => {
                inputFormat = 'dd/MM/yyyy';
                inputDate = '12/10/2015';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2015, 11, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);
                const date = dateTimeEditor.value.getDate();

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toBeGreaterThan(date);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getDate()).toEqual(date);
            });

            it('should not loop over to next month when incrementing date', () => {
                inputFormat = 'dd/MM/yyyy';
                inputDate = '29/02/2020';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2020, 1, 29);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toEqual(1);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('should not loop over to next year when incrementing month', () => {
                inputFormat = 'dd/MM/yyyy';
                inputDate = '29/12/2020';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2020, 11, 29);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(0);
                expect(dateTimeEditor.value.getFullYear()).toEqual(2020);
            });

            it('should update date part if next/previous month\'s max date is less than the current one\'s', () => {
                inputFormat = 'dd/MM/yyyy';
                inputDate = '31/01/2020';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2020, 0, 31);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Month);
                expect(dateTimeEditor.value.getDate()).toEqual(29);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('should prioritize Date for spinning, if it is set in format', () => {
                inputFormat = 'dd/M/yy HH:mm:ss tt';
                inputDate = '11/03/2020 00:00:00 AM';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2020, 2, 11);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toEqual(12);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getDate()).toEqual(11);
            });

            it('should not loop over when isSpinLoop is false', () => {
                inputFormat = 'dd/MM/yyyy';
                inputDate = '31/03/2020';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();
                dateTimeEditor.isSpinLoop = false;

                dateTimeEditor.value = new Date(2020, 2, 31);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toEqual(31);

                dateTimeEditor.value = new Date(2020, 1, 31);
                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('should loop over when isSpinLoop is true (default)', () => {
                inputFormat = 'dd/MM/yyyy';
                inputDate = '31/03/2020';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2020, 2, 31);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);
                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toEqual(1);

                dateTimeEditor.value = new Date(2020, 0, 31);
                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(11);
            });
        });

        describe('Time portions spinning', () => {
            it('should correctly increment / decrement time portions with passed in DatePart', () => {
                inputFormat = 'dd/MM/yyyy HH:mm:ss';
                inputDate = '10/10/2010 12:10:34';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2010, 11, 10, 12, 10, 34);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);
                const minutes = dateTimeEditor.value.getMinutes();
                const seconds = dateTimeEditor.value.getSeconds();

                dateTimeEditor.increment(DatePart.Minutes);
                expect(dateTimeEditor.value.getMinutes()).toBeGreaterThan(minutes);

                dateTimeEditor.decrement(DatePart.Seconds);
                expect(dateTimeEditor.value.getSeconds()).toBeLessThan(seconds);
            });

            it('should correctly increment / decrement time portions without passed in DatePart', () => {
                inputFormat = 'HH:mm:ss tt';
                inputDate = '';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();
                /*
                 * format must be set because the editor will prioritize Date if Hours is not set
                 * and no DatePart is provided to increment / decrement
                 */
                dateTimeEditor.value = new Date();
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);
                const hours = dateTimeEditor.value.getHours();

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getHours()).toBeGreaterThan(hours);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getHours()).toEqual(hours);
            });

            it('should not loop over to next minute when incrementing seconds', () => {
                inputFormat = 'dd/MM/yyyy HH:mm:ss';
                inputDate = '20/01/2019 20:05:59';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2019, 1, 20, 20, 5, 59);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Seconds);
                expect(dateTimeEditor.value.getMinutes()).toEqual(5);
                expect(dateTimeEditor.value.getSeconds()).toEqual(0);
            });

            it('should not loop over to next hour when incrementing minutes', () => {
                inputFormat = 'dd/MM/yyyy HH:mm:ss';
                inputDate = '20/01/2019 20:59:12';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2019, 1, 20, 20, 59, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Minutes);
                expect(dateTimeEditor.value.getHours()).toEqual(20);
                expect(dateTimeEditor.value.getMinutes()).toEqual(0);
            });

            it('should not loop over to next day when incrementing hours', () => {
                inputFormat = 'dd/MM/yyyy HH:mm:ss';
                inputDate = '20/01/2019 23:13:12';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2019, 1, 20, 23, 13, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getDate()).toEqual(20);
                expect(dateTimeEditor.value.getHours()).toEqual(0);
            });

            it('should not loop over when isSpinLoop is false', () => {
                inputFormat = 'dd/MM/yyyy HH:mm:ss';
                inputDate = '20/01/2019 23:13:12';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();
                dateTimeEditor.isSpinLoop = false;
                dateTimeEditor.value = new Date(2019, 1, 20, 23, 0, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getHours()).toEqual(23);

                dateTimeEditor.decrement(DatePart.Minutes);
                expect(dateTimeEditor.value.getMinutes()).toEqual(0);
            });

            it('should loop over when isSpinLoop is true (default)', () => {
                inputFormat = 'dd/MM/yyyy HH:mm:ss';
                inputDate = '20/02/2019 23:15:12';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.value = new Date(2019, 1, 20, 23, 15, 0);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getHours()).toEqual(0);

                dateTimeEditor.decrement(DatePart.Seconds);
                expect(dateTimeEditor.value.getSeconds()).toEqual(59);
            });

            it('should properly parse AM/PM no matter where it is in the format', () => {
                inputFormat = 'dd tt yyyy-MM mm-ss-hh';
                inputDate = '12 AM 2020-06 14-15-11';
                elementRef = { nativeElement: { value: inputDate } };
                initializeDateTimeEditor();

                dateTimeEditor.inputFormat = inputFormat;
                expect(dateTimeEditor.mask).toEqual('00 LL 0000-00 00-00-00');

                dateTimeEditor.value = new Date(2020, 5, 12, 11, 15, 14);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue(inputDate);

                dateTimeEditor.increment(DatePart.AmPm);
                expect(dateTimeEditor.value).toEqual(new Date(2020, 5, 12, 23, 15, 14));
            });
        });
    });

    describe('Integration tests', () => {
        const dateTimeOptions = {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        };
        let fixture;
        let inputElement: DebugElement;
        let dateTimeEditorDirective: IgxDateTimeEditorDirective;
        describe('Key interaction tests', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDateTimeEditorSampleComponent
                    ],
                    imports: [IgxInputGroupModule, IgxDateTimeEditorModule, FormsModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(async () => {
                fixture = TestBed.createComponent(IgxDateTimeEditorSampleComponent);
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('input'));
                dateTimeEditorDirective = inputElement.injector.get(IgxDateTimeEditorDirective);
            });
            it('should correctly display input format during user input', () => {
                fixture.componentInstance.dateTimeFormat = 'dd/MM/yy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('1', inputElement);
                expect(inputElement.nativeElement.value).toEqual('1_/__/__');
                UIInteractions.simulateTyping('9', inputElement, 1, 1);
                expect(inputElement.nativeElement.value).toEqual('19/__/__');
                UIInteractions.simulateTyping('1', inputElement, 2, 2);
                expect(inputElement.nativeElement.value).toEqual('19/1_/__');
                UIInteractions.simulateTyping('2', inputElement, 4, 4);
                expect(inputElement.nativeElement.value).toEqual('19/12/__');
                UIInteractions.simulateTyping('0', inputElement, 5, 5);
                expect(inputElement.nativeElement.value).toEqual('19/12/0_');
                UIInteractions.simulateTyping('8', inputElement, 7, 7);
                expect(inputElement.nativeElement.value).toEqual('19/12/08');
            });
            it('should not accept invalid date.', () => {
                fixture.componentInstance.dateTimeFormat = 'dd/MM/yy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('333333', inputElement);
                expect(inputElement.nativeElement.value).toEqual('33/33/33');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');
            });
            it('should autofill missing date/time segments on blur.', () => {
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('8', inputElement);
                expect(inputElement.nativeElement.value).toEqual('8_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                const date = new Date(2000, 0, 8, 0, 0, 0);
                let result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('5', inputElement, 7, 7);
                expect(inputElement.nativeElement.value).toEqual('__/__/_5__ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date.setFullYear(2005);
                date.setDate(1);
                result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('3', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 3_:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date.setFullYear(2000);
                date.setHours(3);
                result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);
            });
            it('should not accept invalid date and time parts.', () => {
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('63', inputElement);
                expect(inputElement.nativeElement.value).toEqual('63/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('63', inputElement, 3, 3);
                expect(inputElement.nativeElement.value).toEqual('__/63/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('25', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 25:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('78', inputElement, 14, 14);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:78:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('78', inputElement, 17, 17);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:78');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');
            });
            it('should correctly show year based on century threshold.', () => {
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('0000', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/0000 __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                const date = new Date(2000, 0, 1, 0, 0, 0);
                let result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('5', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/5___ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date.setFullYear(2005);
                result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('16', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/16__ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date.setFullYear(2016);
                result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('169', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/169_ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date.setFullYear(169);
                result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/169,/g, '0169');
                expect(inputElement.nativeElement.value).toEqual(result);
            });
            it('should support different display and input formats.', () => {
                fixture.componentInstance.displayFormat = 'longDate';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                let date = new Date(2000, 0, 9, 0, 0, 0);
                const options = { month: 'long', day: 'numeric' };
                let result = `${ControlsFunction.formatDate(date, options)}, ${date.getFullYear()}`;
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'dd/MM/yyy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('169', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/169_ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date = new Date(169, 0, 1, 0, 0, 0);
                const customOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
                result = ControlsFunction.formatDate(date, customOptions);
                expect(inputElement.nativeElement.value).toEqual(result);
            });
            it('should support long and short date formats', () => {
                fixture.componentInstance.displayFormat = 'longDate';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                let date = new Date(2000, 0, 9, 0, 0, 0);
                const longDateOptions = { month: 'long', day: 'numeric' };
                let result = `${ControlsFunction.formatDate(date, longDateOptions)}, ${date.getFullYear()}`;
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'shortDate';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                const shortDateOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                result = ControlsFunction.formatDate(date, shortDateOptions);
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'fullDate';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                const fullDateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
                result = ControlsFunction.formatDate(date, fullDateOptions);
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'shortTime';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('1', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 1_:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date = new Date(0, 0, 0, 1, 0, 0);
                const shortTimeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
                result = ControlsFunction.formatDate(date, shortTimeOptions);
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'longTime';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('2', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 2_:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date = new Date(0, 0, 0, 2, 0, 0);
                const longTimeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
                result = ControlsFunction.formatDate(date, longTimeOptions);
                const offset = date.getTimezoneOffset();
                const tz = (offset > 0 ? '-' : '+') + (Math.abs(offset) / 60);
                result = `${result} GMT${tz}`;
                expect(inputElement.nativeElement.value).toEqual(result);
            });
            it('should be able to apply custom display format.', fakeAsync(() => {
                // default format
                const date = new Date(2003, 3, 5, 0, 0, 0);
                fixture.componentInstance.date = new Date(2003, 3, 5, 0, 0, 0);
                fixture.detectChanges();
                tick();
                let result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                // custom format
                fixture.componentInstance.displayFormat = 'EEEE d MMMM y h:mm a';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('1', inputElement);
                date.setDate(15);
                result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date.setMonth(3);
                const shortTimeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
                const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
                const resultDate = ControlsFunction.formatDate(date, dateOptions, 'en-GB').replace(/,/g, '');
                result = `${resultDate} ${ControlsFunction.formatDate(date, shortTimeOptions)}`;
                expect(inputElement.nativeElement.value).toEqual(result);
            }));
            it('should convert dates correctly on paste when different display and input formats are set.', () => {
                // display format = input format
                let date = new Date(2020, 10, 10, 10, 10, 10);
                let inputDate = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);

                // display format != input format
                fixture.componentInstance.displayFormat = 'd/M/yy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                const shortDateOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                const result = ControlsFunction.formatDate(date, shortDateOptions, 'en-GB');
                expect(inputElement.nativeElement.value).toEqual(result);

                inputDate = '6/7/28';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');

                fixture.componentInstance.dateTimeFormat = 'd/M/yy';
                fixture.detectChanges();
                fixture.componentInstance.displayFormat = 'dd/MM/yyyy';
                fixture.detectChanges();

                // inputElement.triggerEventHandler('focus', {});
                // fixture.detectChanges();
                // UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                // fixture.detectChanges();
                // inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                // fixture.detectChanges();
                // expect(inputElement.nativeElement.value).toEqual('__/__/__');

                date = new Date(2028, 7, 16, 0, 0, 0);
                inputDate = '16/07/28';
                const longDateOptions = { day: '2-digit', month: '2-digit', year: '2-digit' };
                inputDate = ControlsFunction.formatDate(date, longDateOptions, 'en-GB');
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                longDateOptions.year = 'numeric';
                inputDate = ControlsFunction.formatDate(date, longDateOptions, 'en-GB');
                expect(inputElement.nativeElement.value).toEqual(inputDate);
            });
            it('should clear input date on clear()', fakeAsync(() => {
                const date = new Date(2003, 3, 5);
                fixture.componentInstance.date = date;
                fixture.detectChanges();
                tick();
                const result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                dateTimeEditorDirective.clear();
                expect(inputElement.nativeElement.value).toEqual('');
            }));
            it('should move the caret to the start/end of the portion with CTRL + arrow left/right keys.', fakeAsync(() => {
                const date = new Date(2003, 4, 5);
                fixture.componentInstance.date = date;
                fixture.detectChanges();
                tick();
                const result = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(result);

                const inputHTMLElement = inputElement.nativeElement as HTMLInputElement;
                inputHTMLElement.setSelectionRange(0, 0);
                fixture.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(2);
                expect(inputHTMLElement.selectionEnd).toEqual(2);

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(0);
                expect(inputHTMLElement.selectionEnd).toEqual(0);

                inputHTMLElement.setSelectionRange(8, 8);
                fixture.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(6);
                expect(inputHTMLElement.selectionEnd).toEqual(6);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(10);
                expect(inputHTMLElement.selectionEnd).toEqual(10);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(13);
                expect(inputHTMLElement.selectionEnd).toEqual(13);

                inputHTMLElement.setSelectionRange(15, 15);
                fixture.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(16);
                expect(inputHTMLElement.selectionEnd).toEqual(16);

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(14);
                expect(inputHTMLElement.selectionEnd).toEqual(14);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(16);
                expect(inputHTMLElement.selectionEnd).toEqual(16);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(19);
                expect(inputHTMLElement.selectionEnd).toEqual(19);

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(17);
                expect(inputHTMLElement.selectionEnd).toEqual(17);
            }));
            it('should not block the user from typing/pasting dates outside of min/max range', () => {
                fixture.componentInstance.minValue = '01/01/2000';
                fixture.componentInstance.maxValue = '31/12/2000';
                fixture.detectChanges();

                let date = new Date(2009, 10, 10, 10, 10, 10);
                let inputDate = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('27', inputElement, 8, 8);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                date = new Date(2027, 0, 1, 0, 0, 0);
                inputDate = ControlsFunction.formatDate(date, dateTimeOptions, 'en-GB').replace(/,/g, '');
                expect(inputElement.nativeElement.value).toEqual(inputDate);
            });
            it('should be able to customize prompt char.', () => {
                fixture.componentInstance.promptChar = '.';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('../../.... ..:..:..');
            });
            it('should be en/disabled when the input is en/disabled.', fakeAsync(() => {
                spyOn(dateTimeEditorDirective, 'setDisabledState');
                fixture.componentInstance.disabled = true;
                fixture.detectChanges();
                tick();
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledWith(true);

                fixture.componentInstance.disabled = false;
                fixture.detectChanges();
                tick();
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledTimes(2);
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledWith(false);
            }));
            it('should emit valueChange event on blur', () => {
                const newDate = new Date(2004, 11, 18);
                fixture.componentInstance.dateTimeFormat = 'dd/MM/yy';
                fixture.detectChanges();
                spyOn(dateTimeEditorDirective.valueChange, 'emit');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('18124', inputElement);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();

                const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
                const result = ControlsFunction.formatDate(newDate, options, 'en-GB');
                expect(inputElement.nativeElement.value).toEqual(result);
                expect(dateTimeEditorDirective.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.valueChange.emit).toHaveBeenCalledWith(newDate);
            });
            it('should emit valueChange event after input is complete', () => {
                const newDate = new Date(2012, 11, 12);
                fixture.componentInstance.dateTimeFormat = 'dd/MM/yy';
                fixture.detectChanges();
                spyOn(dateTimeEditorDirective.valueChange, 'emit');
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('121212', inputElement);
                fixture.detectChanges();
                expect(dateTimeEditorDirective.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.valueChange.emit).toHaveBeenCalledWith(newDate);
            });
            it('should fire validationFailed when input date is outside date range.', () => {
                fixture.componentInstance.dateTimeFormat = 'dd-MM-yyyy';
                fixture.componentInstance.minDate = new Date(2020, 1, 20);
                fixture.componentInstance.maxDate = new Date(2020, 1, 25);
                fixture.detectChanges();
                spyOn(dateTimeEditorDirective.validationFailed, 'emit');

                // date within the range
                let inputDate = '22-02-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).not.toHaveBeenCalled();

                // date > maxValue
                let oldDate = new Date(2020, 1, 22);
                let newDate = new Date(2020, 1, 26);
                inputDate = '26-02-2020';
                let args = { oldValue: oldDate, newValue: newDate, userInput: inputDate };
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);

                // date < minValue
                oldDate = newDate;
                newDate = new Date(2020, 1, 12);
                inputDate = '12-02-2020';
                args = { oldValue: oldDate, newValue: newDate, userInput: inputDate };
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(2);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
            it('should fire validationFailed when input date is invalid.', () => {
                fixture.componentInstance.dateTimeFormat = 'dd-MM-yyyy';
                fixture.componentInstance.minDate = new Date(2000, 1, 1);
                fixture.componentInstance.maxDate = new Date(2050, 1, 25);
                fixture.detectChanges();
                spyOn(dateTimeEditorDirective.validationFailed, 'emit').and.callThrough();

                // valid date
                let inputDate = '22-02-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).not.toHaveBeenCalled();

                // invalid date
                const oldDate = new Date(2020, 1, 22);
                inputDate = '99-99-2020';
                const args = { oldValue: oldDate, newValue: null, userInput: inputDate };
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('');
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
            it('should properly increment/decrement date-time portions on wheel', fakeAsync(() => {
                fixture.componentInstance.dateTimeFormat = 'dd-MM-yyyy';
                fixture.detectChanges();
                const today = new Date();
                dateTimeEditorDirective.value = today;

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                dateTimeEditorDirective.nativeElement.setSelectionRange(1, 1);
                inputElement.triggerEventHandler('wheel', new WheelEvent('wheel', { deltaY: -1 }));
                fixture.detectChanges();
                expect(dateTimeEditorDirective.value.getDate()).toEqual(new Date().getDate() - 1);
            }));
        });

        describe('Form control tests: ', () => {
            let form: FormGroup;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDateTimeEditorFormComponent
                    ],
                    imports: [
                        IgxInputGroupModule,
                        IgxDateTimeEditorModule,
                        NoopAnimationsModule,
                        ReactiveFormsModule,
                        FormsModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxDateTimeEditorFormComponent);
                fixture.detectChanges();
                form = fixture.componentInstance.reactiveForm;
                inputElement = fixture.debugElement.query(By.css('input'));
                dateTimeEditorDirective = inputElement.injector.get(IgxDateTimeEditorDirective);
            });
            it('should validate properly when used as form control.', () => {
                spyOn(dateTimeEditorDirective.validationFailed, 'emit').and.callThrough();
                const dateEditor = form.controls['dateEditor'];
                const args = { oldValue: '', newValue: null };
                const inputDate = '99-99-9999';

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                fixture.detectChanges();
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();

                expect(inputElement.nativeElement.value).toEqual('');
                expect(form.valid).toBeFalsy();
                expect(dateEditor.valid).toBeFalsy();
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                // expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
            it('should validate properly min/max value when used as form control.', () => {
                fixture.componentInstance.minDate = new Date(2020, 2, 20);
                fixture.componentInstance.maxDate = new Date(2020, 2, 25);
                spyOn(dateTimeEditorDirective.validationFailed, 'emit');
                const dateEditor = form.controls['dateEditor'];

                let inputDate = '21-03-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                fixture.detectChanges();
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(form.valid).toBeTruthy();
                expect(dateEditor.valid).toBeTruthy();
                expect(dateTimeEditorDirective.validationFailed.emit).not.toHaveBeenCalled();

                inputDate = '21-02-2020';
                const args = { oldValue: new Date(2020, 2, 21), newValue: new Date(2020, 1, 21), userInput: inputDate };
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                fixture.detectChanges();
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(form.valid).toBeFalsy();
                expect(dateEditor.valid).toBeFalsy();
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
            it('should properly submit values when used as a form control', () => {
                const inputDate = '09-04-2020';
                expect(form.valid).toBeFalsy();
                form.controls['dateEditor'].setValue(inputDate);
                expect(form.valid).toBeTruthy();

                let result: string;
                fixture.componentInstance.submitted.subscribe((value) => result = value);
                fixture.componentInstance.submit();
                expect(result).toBe(inputDate);
            });
        });
    });
});


@Component({
    template: `
<igx-input-group #igxInputGroup>
        <input type="text" igxInput [disabled]="disabled" [readonly]="readonly"
            [igxDateTimeEditor]="dateTimeFormat" [displayFormat]="displayFormat"
            [(ngModel)]="date" [minValue]="minDate" [maxValue]="maxDate" [promptChar]="promptChar"/>
    </igx-input-group>
`
})
export class IgxDateTimeEditorSampleComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    public date: Date;
    public dateTimeFormat = 'dd/MM/yyyy HH:mm:ss';
    public displayFormat: string;
    public minDate: string;
    public maxDate: string;
    public promptChar = '_';
    public disabled = false;
    public readonly = false;
}

@Component({
    template: `
    <form (ngSubmit)="submit()" [formGroup]="reactiveForm">
    <igx-input-group>
        <input formControlName="dateEditor" type="text"
        igxInput [igxDateTimeEditor]="dateTimeFormat" [minValue]="minDate" [maxValue]="maxDate"/>
    </igx-input-group>
</form>
`
})

class IgxDateTimeEditorFormComponent {
    @ViewChild('dateEditor', { read: IgxInputDirective, static: true }) formInput: IgxInputDirective;
    @Output() submitted = new EventEmitter<any>();
    reactiveForm: FormGroup;
    public dateTimeFormat = 'dd-MM-yyyy';
    public minDate: Date;
    public maxDate: Date;

    constructor(fb: FormBuilder) {
        this.reactiveForm = fb.group({
            dateEditor: ['', Validators.required]
        });
    }

    submit() {
        if (this.reactiveForm.valid) {
            this.submitted.emit(this.reactiveForm.value.dateEditor);
        }
    }
}
