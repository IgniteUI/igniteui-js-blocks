import { Component, ViewChild, ViewChildren, QueryList, DebugElement } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxInputGroupComponent, IgxInputGroupModule } from '../../input-group/input-group.component';
import { IgxInputDirective, IgxInputState } from './input.directive';
import { configureTestSuite } from '../../test-utils/configure-suite';

const INPUT_CSS_CLASS = 'igx-input-group__input';
const TEXTAREA_CSS_CLASS = 'igx-input-group__textarea';

const INPUT_GROUP_FOCUSED_CSS_CLASS = 'igx-input-group--focused';
const INPUT_GROUP_PLACEHOLDER_CSS_CLASS = 'igx-input-group--placeholder';
const INPUT_GROUP_FILLED_CSS_CLASS = 'igx-input-group--filled';
const INPUT_GROUP_DISABLED_CSS_CLASS = 'igx-input-group--disabled';

const INPUT_GROUP_REQUIRED_CSS_CLASS = 'igx-input-group--required';
const INPUT_GROUP_VALID_CSS_CLASS = 'igx-input-group--valid';
const INPUT_GROUP_INVALID_CSS_CLASS = 'igx-input-group--invalid';

describe('IgxInput', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                InputComponent,
                TextareaComponent,
                InputWithPlaceholderComponent,
                InitiallyFilledInputComponent,
                FilledInputComponent,
                DisabledInputComponent,
                RequiredInputComponent,
                RequiredTwoWayDataBoundInputComponent,
                DataBoundDisabledInputComponent,
                DataBoundDisabledInputWithoutValueComponent,
                ReactiveFormComponent,
                InputsWithSameNameAttributesComponent,
                ToggleRequiredWithNgModelInputComponent
            ],
            imports: [
                IgxInputGroupModule,
                FormsModule,
                ReactiveFormsModule
            ]
        })
            .compileComponents();
    }));

    it('Initializes an input.', () => {
        const fixture = TestBed.createComponent(InputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        expect(inputElement.classList.length).toBe(1);
        expect(inputElement.classList.contains(INPUT_CSS_CLASS)).toBe(true);
    });

    it('Initializes a textarea.', () => {
        const fixture = TestBed.createComponent(TextareaComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        expect(inputElement.classList.length).toBe(1);
        expect(inputElement.classList.contains(TEXTAREA_CSS_CLASS)).toBe(true);
    });

    it('should apply focused style.', () => {
        const fixture = TestBed.createComponent(InputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        inputElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FOCUSED_CSS_CLASS)).toBe(true);
        expect(igxInput.focused).toBe(true);

        inputElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_FOCUSED_CSS_CLASS)).toBe(false);
        expect(igxInput.focused).toBe(false);
    });

    it('should have a placeholder style. Placeholder API.', () => {
        const fixture = TestBed.createComponent(InputWithPlaceholderComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_PLACEHOLDER_CSS_CLASS)).toBe(true);

        const igxInput = fixture.componentInstance.igxInput;
        expect(igxInput.hasPlaceholder).toBe(true);
        expect(igxInput.placeholder).toBe('Test');
    });

    it('should have an initial filled style when data bound.', fakeAsync(() => {
        const fixture = TestBed.createComponent(InitiallyFilledInputComponent);
        fixture.detectChanges();

        tick();
        fixture.detectChanges();

        const notFilledUndefined = fixture.componentInstance.igxInputGroupNotFilledUndefined.element.nativeElement;
        expect(notFilledUndefined.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const notFilledNull = fixture.componentInstance.igxInputGroupNotFilledNull.element.nativeElement;
        expect(notFilledNull.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const notFilledEmpty = fixture.componentInstance.igxInputGroupNotFilledEmpty.element.nativeElement;
        expect(notFilledEmpty.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const filledString = fixture.componentInstance.igxInputGroupFilledString.element.nativeElement;
        expect(filledString.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledNumber = fixture.componentInstance.igxInputGroupFilledNumber.element.nativeElement;
        expect(filledNumber.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledBoolFalse = fixture.componentInstance.igxInputGroupFilledBoolFalse.element.nativeElement;
        expect(filledBoolFalse.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledBoolTrue = fixture.componentInstance.igxInputGroupFilledBoolTrue.element.nativeElement;
        expect(filledBoolTrue.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledDate = fixture.componentInstance.igxInputGroupFilledDate.element.nativeElement;
        expect(filledDate.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);
    }));

    it('should have a filled style. Value API.', () => {
        const fixture = TestBed.createComponent(FilledInputComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        inputElement.value = '';
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const igxInput = fixture.componentInstance.igxInput;
        igxInput.value = 'test';
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);
        expect(igxInput.value).toBe('test');
    });

    it('should have a disabled style. Disabled API.', () => {
        const fixture = TestBed.createComponent(DisabledInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(true);
        expect(inputElement.disabled).toBe(true);
        expect(igxInput.disabled).toBe(true);

        igxInput.disabled = false;
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(false);
        expect(inputElement.disabled).toBe(false);
        expect(igxInput.disabled).toBe(false);
    });

    it('should have a disabled style via binding', () => {
        const fixture = TestBed.createComponent(DataBoundDisabledInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(false);
        expect(inputElement.disabled).toBe(false);
        expect(igxInput.disabled).toBe(false);

        fixture.componentInstance.disabled = true;
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(true);
        expect(inputElement.disabled).toBe(true);
        expect(igxInput.disabled).toBe(true);
    });

    it('should have disabled style if disabled attr is set without value', () => {
        const fixture = TestBed.createComponent(DataBoundDisabledInputWithoutValueComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(true);
        expect(inputElement.disabled).toBe(true);
        expect(igxInput.disabled).toBe(true);

        fixture.componentInstance.changeDisabledState();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(false);
        expect(inputElement.disabled).toBe(false);
        expect(igxInput.disabled).toBe(false);
    });

    it('should style required input correctly.', () => {
        const fixture = TestBed.createComponent(RequiredInputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        testRequiredValidation(inputElement, fixture);
    });

    it('should update style when required input\'s value is set.', () => {
        const fixture = TestBed.createComponent(RequiredInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;

        dispatchInputEvent('focus', inputElement, fixture);
        dispatchInputEvent('blur', inputElement, fixture);

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);

        dispatchInputEvent('focus', inputElement, fixture);
        igxInput.value = 'test';
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.VALID);


        igxInput.value = '';
        fixture.detectChanges();

        dispatchInputEvent('focus', inputElement, fixture);
        dispatchInputEvent('blur', inputElement, fixture);

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
    });

    it('should style required input with two-way databinding correctly.', () => {
        const fixture = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        testRequiredValidation(inputElement, fixture);
    });

    it('should work properly with reactive forms validation.', () => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();

        fixture.debugElement.componentInstance.markAsTouched();
        fixture.detectChanges();

        const invalidInputGroups = fixture.debugElement.nativeElement.querySelectorAll(`.igx-input-group--invalid`);
        expect(invalidInputGroups.length).toBe(4);

        const requiredInputGroups = fixture.debugElement.nativeElement.querySelectorAll(`.igx-input-group--required`);
        expect(requiredInputGroups.length).toBe(4);
    });

    it('When updating two inputs with same attribute names through ngModel, label should responds', fakeAsync(() => {

        const fix = TestBed.createComponent(InputsWithSameNameAttributesComponent);
        fix.detectChanges();

        let igxInputGroups = fix.debugElement.queryAll(By.css('igx-input-group'));
        igxInputGroups.forEach(element => {
            const inputGroup = element.nativeElement;
            expect(inputGroup.classList.contains('igx-input-group--filled')).toBe(false);
        });

        fix.componentInstance.model.firstName = 'Mike';
        fix.detectChanges();

        tick();
        fix.detectChanges();

        igxInputGroups = fix.debugElement.queryAll(By.css('igx-input-group'));
        igxInputGroups.forEach(element => {
            const inputGroup = element.nativeElement;
            expect(inputGroup.classList.contains('igx-input-group--filled')).toBe(true);
        });
    }));

    it('should not draw input as invalid when updated through ngModel and input is pristine and untouched', fakeAsync(() => {
        const fix = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fix.detectChanges();

        const inputGroup = fix.debugElement.children[0];

        fix.componentInstance.user.firstName = 'Bobby';
        fix.detectChanges();
        tick();
        fix.detectChanges();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--filled')).toBe(true);

        fix.componentInstance.user.firstName = undefined;
        fix.detectChanges();
        tick();
        fix.detectChanges();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);

        fix.componentInstance.user.firstName = '';
        fix.detectChanges();
        tick();
        fix.detectChanges();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);
    }));

    it('should not draw input as invalid when value is changed via reactive form and input is pristine and untouched', () => {
        const fix = TestBed.createComponent(ReactiveFormComponent);
        fix.detectChanges();

        const igxInputGroups = fix.debugElement.queryAll(By.css('igx-input-group'));
        const firstInputGroup = igxInputGroups[0];

        fix.componentInstance.form.patchValue({ str: 'test' });
        fix.detectChanges();
        expect(firstInputGroup.nativeElement.classList.contains('igx-input-group--filled')).toBe(true);

        fix.componentInstance.form.patchValue({ str: undefined });
        fix.detectChanges();
        expect(firstInputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);

        fix.componentInstance.form.patchValue({ str: '' });
        fix.detectChanges();
        expect(firstInputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);
    });

    it('should correctly update state of input without model when updated trough code', fakeAsync(() => {
        const fixture = TestBed.createComponent(RequiredInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        igxInput.value = 'test';
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);


        igxInput.value = '';
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
    }));

    it('should correctly update state of input when updated through ngModel, no user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.componentInstance.igxInputGroup.element.nativeElement;
        const igxInput = fixture.componentInstance.igxInput;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.user.firstName = 'Bobby';

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        igxInput.value = '';
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        igxInput.value = undefined;
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
    }));

    it('should correctly update state of input when value is changed via reactive, no user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();

        const igxInputGroups = fixture.debugElement.queryAll(By.css('igx-input-group'));
        const inputGroupElement = igxInputGroups[0].nativeElement;
        const igxInput = fixture.componentInstance.strIgxInput;

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.form.patchValue({ str: 'Bobby' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.form.patchValue({ str: '' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.form.patchValue({ str: undefined });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.form.reset();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
    }));

    it('should correctly update state of input when updated through ngModel, with user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.componentInstance.igxInputGroup.element.nativeElement;
        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = igxInput.nativeElement;

        dispatchInputEvent('focus', inputElement, fixture);
        dispatchInputEvent('blur', inputElement, fixture);

        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);

        fixture.componentInstance.user.firstName = 'Bobby';

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.user.firstName = '';
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);

        fixture.componentInstance.user.firstName = undefined;
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
    }));

    it('should correctly update state of input when value is changed via reactive, with user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();

        const igxInputGroups = fixture.debugElement.queryAll(By.css('igx-input-group'));
        const inputGroupElement = igxInputGroups[0].nativeElement;
        const igxInput = fixture.componentInstance.strIgxInput;
        const input = igxInput.nativeElement;

        dispatchInputEvent('focus', input, fixture);
        dispatchInputEvent('blur', input, fixture);
        dispatchInputEvent('input', input, fixture);

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);

        fixture.componentInstance.form.patchValue({ str: 'Bobby' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.form.patchValue({ str: '' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);

        fixture.componentInstance.form.patchValue({ str: undefined });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);

        fixture.componentInstance.form.reset();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
    }));

    it('should correctly update enabled/disabled state of igxInput when changed via reactive form', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();
        const igxInput = fixture.componentInstance.strIgxInput;

        fixture.componentInstance.form.disable();
        expect(igxInput.disabled).toBe(true);

        fixture.componentInstance.form.get('str').enable();
        expect(igxInput.disabled).toBe(false);
    }));

    it('should style input when required is toggled dynamically.', () => {
        const fixture = TestBed.createComponent(ToggleRequiredWithNgModelInputComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const input = instance.igxInputs.toArray()[1];
        const inputGroup = instance.igxInputGroups.toArray()[1];

        expect(input.required).toBe(false);
        expect(inputGroup.isRequired).toBeFalsy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(false);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);

        instance.isRequired = true;
        fixture.detectChanges();

        expect(input.required).toBe(true);

        expect(inputGroup.isRequired).toBeTruthy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(input.valid).toBe(IgxInputState.INVALID);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);
        expect(input.valid).toBe(IgxInputState.VALID);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
    });

    it('should style input with ngModel when required is toggled dynamically.', () => {
        const fixture = TestBed.createComponent(ToggleRequiredWithNgModelInputComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const input = instance.igxInputs.toArray()[0];
        const inputGroup = instance.igxInputGroups.toArray()[0];

        expect(input.required).toBe(false);
        expect(inputGroup.isRequired).toBeFalsy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(false);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);

        instance.isRequired = true;
        fixture.detectChanges();

        expect(input.required).toBe(true);

        expect(inputGroup.isRequired).toBeTruthy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '';
        dispatchInputEvent('input', input.nativeElement, fixture);
        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);

        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
    });

    it('should not set null or undefined as input value', () => {
        const fixture = TestBed.createComponent(InputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        expect(igxInput.value).toBe('');

        igxInput.value = undefined;
        expect(igxInput.value).toBe('');

        igxInput.value = null;
        expect(igxInput.value).toBe('');

        igxInput.value = 0;
        expect(igxInput.value).toBe('0');

        igxInput.value = false;
        expect(igxInput.value).toBe('false');

        igxInput.value = 'Test';
        expect(igxInput.value).toBe('Test');
    });
});

@Component({
    template: `
                    <form>
                        <igx-input-group #igxInputGroup>
                            <label for="firstName" #igxLabel igxLabel>Name</label>
                            <input name="firstName" [(ngModel)]="model.firstName" type="text" igxInput />
                        </igx-input-group>
                        <igx-input-group #igxInputGroup>
                            <label for="firstName" #igxLabel igxLabel>Name</label>
                            <input name="firstName" [(ngModel)]="model.firstName"  type="text" igxInput />
                        </igx-input-group>
                    </form>` })
class InputsWithSameNameAttributesComponent {
    @ViewChildren('igxInputGroup') public igxInputGroup: QueryList<DebugElement>;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;

    model = {
        firstName: null
    };
}


@Component({
    template: `<igx-input-group #igxInputGroup>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" #igxInput type="text" igxInput />
                        </igx-input-group>` })
class InputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `<igx-input-group>
                            <label for="test" igxLabel>Test</label>
                            <textarea name="test" igxInput></textarea>
                        </igx-input-group>` })
class TextareaComponent {
}

@Component({
    template: `<igx-input-group>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" placeholder="Test" #igxInput type="text" igxInput />
                        </igx-input-group>` })
class InputWithPlaceholderComponent {
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" #igxInput type="text" igxInput value="Test" />
                        </igx-input-group>` })
class FilledInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" #igxInput type="text" igxInput value="Test" disabled="disabled" />
                        </igx-input-group>` })
class DisabledInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" #igxInput type="text" igxInput required="required" />
                        </igx-input-group>` })
class RequiredInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" #igxInput type="text" igxInput [(ngModel)]="user.firstName" required="required" />
                        </igx-input-group>` })
class RequiredTwoWayDataBoundInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;

    public user = {
        firstName: ''
    };
}

@Component({
    template: `<igx-input-group #igxInputGroupNotFilledUndefined>
                            <label for="not-filled-undefined" igxLabel>Not Filled Undefined</label>
                            <input name="not-filled-undefined" igxInput [(ngModel)]="notFilledUndefined" />
                        </igx-input-group>

                        <igx-input-group #igxInputGroupNotFilledNull>
                            <label for="not-filled-null" igxLabel>Not Filled Null</label>
                            <input name="not-filled-null" igxInput [(ngModel)]="notFilledNull" />
                        </igx-input-group>

                        <igx-input-group #igxInputGroupNotFilledEmpty>
                            <label for="not-filled-empty" igxLabel>Not Filled Empty</label>
                            <input name="not-filled-empty" igxInput [(ngModel)]="notFilledEmpty" />
                        </igx-input-group>

                        <igx-input-group #igxInputGroupFilledString>
                            <label for="filled-string" igxLabel>Filled String</label>
                            <input name="filled-string" igxInput [(ngModel)]="user.firstName" />
                        </igx-input-group>

                        <igx-input-group #igxInputGroupFilledNumber>
                            <label for="filled-number" igxLabel>Filled Number</label>
                            <input name="filled-number" igxInput [(ngModel)]="user.age" />
                        </igx-input-group>

                        <igx-input-group #igxInputGroupFilledBoolFalse>
                            <label for="filled-bool-false" igxLabel>Filled Bool False</label>
                            <input name="filled-bool-false" igxInput [(ngModel)]="user.vegetarian" />
                        </igx-input-group>

                        <igx-input-group #igxInputGroupFilledBoolTrue>
                            <label for="filled-bool-true" igxLabel>Filled Bool True</label>
                            <input name="filled-bool-true" igxInput [(ngModel)]="user.smoker" />
                        </igx-input-group>

                        <igx-input-group #igxInputGroupFilledDate>
                            <label for="filled-date" igxLabel>Filled Date</label>
                            <input name="filled-date" igxInput [(ngModel)]="user.birthDate" />
                        </igx-input-group>
                        `})
class InitiallyFilledInputComponent {
    @ViewChild('igxInputGroupNotFilledUndefined', { static: true }) public igxInputGroupNotFilledUndefined: IgxInputGroupComponent;
    @ViewChild('igxInputGroupNotFilledNull', { static: true }) public igxInputGroupNotFilledNull: IgxInputGroupComponent;
    @ViewChild('igxInputGroupNotFilledEmpty', { static: true }) public igxInputGroupNotFilledEmpty: IgxInputGroupComponent;

    @ViewChild('igxInputGroupFilledString', { static: true }) public igxInputGroupFilledString: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledNumber', { static: true }) public igxInputGroupFilledNumber: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledBoolFalse', { static: true }) public igxInputGroupFilledBoolFalse: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledBoolTrue', { static: true }) public igxInputGroupFilledBoolTrue: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledDate', { static: true }) public igxInputGroupFilledDate: IgxInputGroupComponent;

    public notFilledUndefined = undefined;
    public notFilledNull = null;
    public notFilledEmpty = '';
    public user = {
        firstName: 'Oke',
        age: 30,
        vegetarian: false,
        smoker: true,
        birthDate: new Date(1988, 1, 1)
    };
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" #igxInput type="text" igxInput [disabled]="disabled" />
                        </igx-input-group>` })
class DataBoundDisabledInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;

    public disabled = false;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <label for="test" igxLabel>Test</label>
                    <input name="test" #igxInput type="text" igxInput disabled />
                </igx-input-group>`
})
class DataBoundDisabledInputWithoutValueComponent extends DataBoundDisabledInputComponent {
    public changeDisabledState() {
        this.igxInput.disabled = !this.igxInput.disabled;
    }
}

@Component({
    template:
        `<form class="wrapper" [formGroup]="form">
        <section>
        <igx-input-group>
            <label igxLabel>single line</label>
            <input #strinput type="text" formControlName="str" igxInput>
        </igx-input-group>
        <br>
        <igx-input-group>
            <label igxLabel>multi line</label>
            <textarea type="text" formControlName="textarea" igxInput></textarea>
        </igx-input-group>
        <br>
        <igx-input-group>
            <label igxLabel>password</label>
            <input type="password" formControlName="password" igxInput>
        </igx-input-group>
        </section>
        <section>
        <igx-input-group>
            <label igxLabel>1000</label>
            <input type="number" formControlName="num" igxInput igxMask="###">
        </igx-input-group>
        </section>
    </form>`
})
class ReactiveFormComponent {
    @ViewChild('strinput', { static: true, read: IgxInputDirective }) public strIgxInput: IgxInputDirective;

    form = this.fb.group({
        str: ['', Validators.required],
        textarea: ['', Validators.required],
        password: ['', Validators.required],
        num: [null, Validators.required]
    });

    constructor(private fb: FormBuilder) { }

    public markAsTouched() {
        if (!this.form.valid) {
            for (const key in this.form.controls) {
                if (this.form.controls[key]) {
                    this.form.controls[key].markAsTouched();
                    this.form.controls[key].updateValueAndValidity();
                }
            }
        }
    }
}

@Component({
    template: `<igx-input-group>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" type="text" igxInput [(ngModel)]="data" [required]="isRequired"/>
                        </igx-input-group>
                        <igx-input-group>
                            <label for="test" igxLabel>Test</label>
                            <input name="test" type="text" igxInput [value]="data1" [required]="isRequired"/>
                        </igx-input-group>` })
class ToggleRequiredWithNgModelInputComponent {
    @ViewChildren(IgxInputDirective)
    public igxInputs: QueryList<IgxInputDirective>;

    @ViewChildren(IgxInputGroupComponent)
    public igxInputGroups: QueryList<IgxInputGroupComponent>;

    public data = '';
    public data1 = '';
    public isRequired = false;
}

const testRequiredValidation = (inputElement, fixture) => {
    dispatchInputEvent('focus', inputElement, fixture);
    inputElement.value = 'test';
    dispatchInputEvent('input', inputElement, fixture);

    const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
    expect(inputGroupElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);
    const igxInput = fixture.componentInstance.igxInput;
    expect(igxInput.valid).toBe(IgxInputState.VALID);

    dispatchInputEvent('blur', inputElement, fixture);

    expect(inputGroupElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
    expect(igxInput.valid).toBe(IgxInputState.INITIAL);

    dispatchInputEvent('focus', inputElement, fixture);
    inputElement.value = '';

    dispatchInputEvent('input', inputElement, fixture);

    expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
    expect(igxInput.valid).toBe(IgxInputState.INVALID);

    dispatchInputEvent('blur', inputElement, fixture);

    expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
    expect(igxInput.valid).toBe(IgxInputState.INVALID);
};

const dispatchInputEvent = (eventName, inputNativeElement, fixture) => {
    inputNativeElement.dispatchEvent(new Event(eventName));
    fixture.detectChanges();
};
