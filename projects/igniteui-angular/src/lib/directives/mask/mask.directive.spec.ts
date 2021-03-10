import { Component, Input, ViewChild, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IgxInputGroupModule } from '../../input-group/input-group.component';
import { IgxMaskModule, IgxMaskDirective } from './mask.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { Replaced } from './mask-parsing.service';
import { By } from '@angular/platform-browser';

describe('igxMask', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AlphanumSpaceMaskComponent,
                AnyCharMaskComponent,
                DefMaskComponent,
                DigitPlusMinusMaskComponent,
                DigitSpaceMaskComponent,
                EventFiringComponent,
                IncludeLiteralsComponent,
                LetterSpaceMaskComponent,
                MaskComponent,
                OneWayBindComponent,
                PipesMaskComponent,
                PlaceholderMaskComponent,
                EmptyMaskTestComponent,
                ReadonlyMaskTestComponent
            ],
            imports: [
                FormsModule,
                IgxInputGroupModule,
                IgxMaskModule
            ]
        })
            .compileComponents();
    }));

    it('Initializes an input with default mask', fakeAsync(() => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.getAttribute('placeholder')).toEqual('CCCCCCCCCC');

        input.nativeElement.dispatchEvent(new Event('click'));
        tick();

        input.nativeElement.value = '@#$YUA123';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('@#$YUA123_');
    }));

    it('Mask rules - digit (0-9) or a space', fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('555 55');

    }));

    it('Mask rules - digit (0-9), plus (+), or minus (-) sign', fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitPlusMinusMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('+359-884 19 08 54');
    }));

    it('Mask rules - letter (a-Z) or a space', fakeAsync(() => {
        const fixture = TestBed.createComponent(LetterSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('AB _CD E');
    }));

    it('Mask rules - alphanumeric (0-9, a-Z) or a space', fakeAsync(() => {
        const fixture = TestBed.createComponent(AlphanumSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('7c_ 8u');
    }));

    it('Mask rules - any keyboard character', fakeAsync(() => {
        const fixture = TestBed.createComponent(AnyCharMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('_=%. p]');
    }));

    it('Enter value with a preset mask and value', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        tick(); // NgModel updateValue Promise

        const comp = fixture.componentInstance;
        const input = comp.input;


        expect(input.nativeElement.value).toEqual('(123) 4567-890');
        expect(comp.value).toEqual('1234567890');

        comp.value = '7777';
        fixture.detectChanges();
        tick();

        expect(input.nativeElement.value).toEqual('(777) 7___-___');
        expect(comp.value).toEqual('7777');
    }));

    it('Should handle the input of invalid values', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = 'abc4569d12';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('(___) 4569-_12');
    }));

    it('Enter incorrect value with a preset mask', fakeAsync(() => {
        pending('This must be remade into a typing test.');
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = 'abc4569d12';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('(456) 912_-___');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = '1111111111111111111';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(111) 1111-111');
    }));

    it('Include literals in component value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IncludeLiteralsComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(555) 55__-___');
    }));

    it('Correct event firing', fakeAsync(() => {
        const fixture = TestBed.createComponent(EventFiringComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = '123';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(123) ____-___');
        expect(fixture.componentInstance.raw).toEqual('123');
    }));

    it('One way binding', fakeAsync(() => {
        const fixture = TestBed.createComponent(OneWayBindComponent);
        fixture.detectChanges();

        const comp = fixture.componentInstance;
        const input = comp.input;

        expect(input.nativeElement.value).toEqual('3456');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('3456****');
        expect(comp.value).toEqual(3456);

        input.nativeElement.value = 'A';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('A*******');
    }));

    it('Selection', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        tick();

        input.nativeElement.select();
        tick();

        const keyEvent = new KeyboardEvent('keydown', { key: '57' });
        input.nativeElement.dispatchEvent(keyEvent);
        tick();

        input.nativeElement.value = '';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(___) ____-___');
    }));

    it('Enter value over literal', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        tick();

        input.nativeElement.select();
        tick();

        input.nativeElement.value = '';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(___) ____-___');

        input.nativeElement.value = '6666';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(666) 6___-___');
    }));

    it('Should successfully drop text in the input', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        tick();
        input.nativeElement.select();
        tick();

        input.nativeElement.value = '4576';
        UIInteractions.simulateDropEvent(input.nativeElement, '4576', 'text');
        fixture.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(457) 6___-___');
    }));

    it('Should display mask on dragenter and remove it on dragleave', fakeAsync(() => {
        const fixture = TestBed.createComponent(EmptyMaskTestComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('CCCCCCCCCC');

        input.nativeElement.dispatchEvent(new DragEvent('dragenter'));
        expect(input.nativeElement.value).toEqual('__________');

        input.nativeElement.dispatchEvent(new DragEvent('dragleave'));
        expect(input.nativeElement.value).toEqual('');
    }));

    it('Apply display and input pipes on blur and focus.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PipesMaskComponent);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('SSS');

        input.nativeElement.dispatchEvent(new Event('blur'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('sss');
    }));

    it('Apply placeholder when value is not defined.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PlaceholderMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('hello');

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('(__) (__)');
        expect(input.nativeElement.placeholder).toEqual('hello');

        input.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('hello');
    }));

    it('should not enter edit mode if it is marked as readonly', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReadonlyMaskTestComponent);
        fixture.detectChanges();

        const maskDirective = fixture.componentInstance.mask;
        spyOn(maskDirective, 'onFocus').and.callThrough();
        spyOn<any>(maskDirective, 'showMask').and.callThrough();

        const input = fixture.debugElement.query(By.css('.igx-input-group__input'));
        input.triggerEventHandler('focus', {});
        fixture.detectChanges();

        expect(maskDirective.onFocus).toHaveBeenCalledTimes(1);
        expect((maskDirective as any).showMask).toHaveBeenCalledTimes(0);
        expect((maskDirective as any).inputValue).toEqual('');
    }));
});

describe('igxMaskDirective ControlValueAccessor Unit', () => {
    let mask: IgxMaskDirective;
    it('Should correctly implement interface methods', () => {
        const mockNgControl = jasmine.createSpyObj('NgControl', ['registerOnChangeCb', 'registerOnTouchedCb']);

        const mockParser = jasmine.createSpyObj('MaskParsingService', {
            applyMask: 'test____',
            replaceInMask: { value: 'test_2__', end: 6 } as Replaced,
            parseValueFromMask: 'test2'
        });
        const format = 'CCCCCCCC';

        // init
        mask = new IgxMaskDirective(null, mockParser, null);
        mask.mask = format;
        mask.registerOnChange(mockNgControl.registerOnChangeCb);
        mask.registerOnTouched(mockNgControl.registerOnTouchedCb);
        spyOn(mask.onValueChange, 'emit');
        const inputGet = spyOnProperty(mask as any, 'inputValue', 'get');
        const inputSet = spyOnProperty(mask as any, 'inputValue', 'set');

        // writeValue
        inputGet.and.returnValue('formatted');
        mask.writeValue('test');
        expect(mockParser.applyMask).toHaveBeenCalledWith('test', jasmine.objectContaining({ format }));
        expect(inputSet).toHaveBeenCalledWith('test____');
        expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
        expect(mask.onValueChange.emit).toHaveBeenCalledWith({ rawValue: 'test', formattedValue: 'formatted' });

        // OnChange callback
        inputGet.and.returnValue('test_2___');
        spyOnProperty(mask as any, 'selectionEnd').and.returnValue(6);
        const setSelectionSpy = spyOn(mask as any, 'setSelectionRange');
        mask.onInputChanged();
        expect(mockParser.replaceInMask).toHaveBeenCalledWith('', 'test_2', jasmine.objectContaining({ format }), 0, 0);
        expect(inputSet).toHaveBeenCalledWith('test_2__');
        expect(setSelectionSpy).toHaveBeenCalledWith(6);
        expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith('test2');

        // OnTouched callback
        mask.onFocus();
        expect(mockNgControl.registerOnTouchedCb).not.toHaveBeenCalled();
        mask.onBlur('');
        expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);
    });
});

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class DefMaskComponent {

    @ViewChild('input', { static: true })
    public input: ElementRef;
    public mask;
    public value;
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class MaskComponent {

    @ViewChild('input', { static: true })
    public input: ElementRef;
    mask = '(000) 0000-000';
    value = '1234567890';
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask" [includeLiterals]="true"/>
                        </igx-input-group>
                        <igx-input-group>
                            <input #input1 igxInput [ngModel]="value"/>
                        </igx-input-group>` })
class IncludeLiteralsComponent {
    @Input() public value = '55555';

    @ViewChild('input', { static: true })
    public input: ElementRef;

    @ViewChild('input1', { static: true })
    public input1: ElementRef;
    public mask = '(000) 0000-000';
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class DigitSpaceMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '999999';
    public value = '555 555';
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class DigitPlusMinusMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '####-### ## ## ##';
    public value = '+359884190854';
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class LetterSpaceMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = 'LL??LL??';
    public value = 'AB 2CD E';
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class AlphanumSpaceMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = 'AAAaaa';
    public value = '7c  8u';
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class AnyCharMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '&&&.CCC';
    public value = ' =% p]';
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="myValue" [igxMask]="myMask"
                            (onValueChange)="handleValueChange($event)"/>
                        </igx-input-group>` })
class EventFiringComponent {

    @ViewChild('input', { static: true })
    public input: ElementRef;
    myValue = '';
    myMask = '(000) 0000-000';
    raw: string;
    formatted: string;

    handleValueChange(event) {
        this.raw = event.rawValue;
        this.formatted = event.formattedValue;
    }
}

@Component({
    template: `<igx-input-group>
                            <input type="text" #input igxInput
                                   [value]="value"
                                   [igxMask]="myMask"
                                   [includeLiterals]="true"
                                   [promptChar]="'* @#'"/>
                        </igx-input-group>` })
class OneWayBindComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    myMask = 'AAAAAAAA';
    value = 3456;
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput
                                [placeholder]="'hello'"
                                [(ngModel)]="value"
                                [igxMask]="mask"/>
                        </igx-input-group>` })
class PlaceholderMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '(00) (00)';
    public value = null;
}

@Component({
    template: `<igx-input-group>
                            <input #input type="text" igxInput
                                [displayValuePipe]="displayFormat"
                                [focusedValuePipe]="inputFormat"
                                [(ngModel)]="value"
                                [igxMask]="mask"/>
                        </igx-input-group>` })
class PipesMaskComponent {

    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = 'CCC';
    public value = 'SSS';

    public displayFormat = new DisplayFormatPipe();
    public inputFormat = new InputFormatPipe();
}

@Component({
    template: `
        <igx-input-group>
            <input #input type="text" igxInput igxMask/>
        </igx-input-group>
    `
})
class EmptyMaskTestComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;
}

@Component({
    template: `<igx-input-group>
                    <input #input type="text" igxInput readonly [igxMask]="'00/00/0000'"/>
                </igx-input-group>`
})
class ReadonlyMaskTestComponent {
    @ViewChild(IgxMaskDirective)
    public mask: IgxMaskDirective;
}

@Pipe({ name: 'inputFormat' })
export class InputFormatPipe implements PipeTransform {
    transform(value: any): string {
        return value.toUpperCase();
    }
}

@Pipe({ name: 'displayFormat' })
export class DisplayFormatPipe implements PipeTransform {
    transform(value: any): string {
        return value.toLowerCase();
    }
}
