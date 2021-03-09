import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxInputGroupComponent, IgxInputGroupModule } from './input-group.component';
import { DisplayDensityToken, DisplayDensity } from '../core/displayDensity';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputDirective } from '../directives/input/input.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxPrefixDirective, IgxSuffixDirective } from '../chips/public_api';
import { IGX_INPUT_GROUP_TYPE, IgxInputGroupType } from './inputGroupType';

const INPUT_GROUP_CSS_CLASS = 'igx-input-group';
const INPUT_GROUP_BOX_CSS_CLASS = 'igx-input-group--box';
const INPUT_GROUP_BORDER_CSS_CLASS = 'igx-input-group--border';
const INPUT_GROUP_SEARCH_CSS_CLASS = 'igx-input-group--search';
const INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS = 'igx-input-group--comfortable';
const INPUT_GROUP_COMPACT_DENSITY_CSS_CLASS = 'igx-input-group--compact';
const INPUT_GROUP_COSY_DENSITY_CSS_CLASS = 'igx-input-group--cosy';

describe('IgxInputGroup', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                InputGroupComponent,
                InputGroupBoxComponent,
                InputGroupBorderComponent,
                InputGroupSearchComponent,
                InputGroupDisabledComponent,
                InputGroupDisabledByDefaultComponent,
                InputGroupCosyDisplayDensityComponent,
                InputGroupDisabledWithoutValueComponent,
                InputGroupCompactDisplayDensityComponent,
                InputGroupInputDisplayDensityComponent
            ],
            imports: [
                IgxInputGroupModule, IgxIconModule
            ]
        })
            .compileComponents();
    }));

    it('Initializes an input group.', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        // the default type should be line
        testInputGroupType('line', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type box.', () => {
        const fixture = TestBed.createComponent(InputGroupBoxComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType('box', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type border.', () => {
        const fixture = TestBed.createComponent(InputGroupBorderComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType('border', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type search.', () => {
        const fixture = TestBed.createComponent(InputGroupSearchComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType('search', igxInputGroup, inputGroupElement);
    });

    it('Should respect type Token and be able to change input group type programmatically.', () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        const igxInputGroup = fixture.componentInstance.igxInputGroup;

        // a Token is passed and can be obtained
        expect(fixture.componentInstance.IGTOKEN).toBe('box');

        // type set via Token is 'box'
        testInputGroupType('box', igxInputGroup, inputGroupElement);

        // user can override Token passing other igxInputGroup types
        igxInputGroup.type = 'border';
        fixture.detectChanges();
        testInputGroupType('border', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'box';
        fixture.detectChanges();
        testInputGroupType('box', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'search';
        fixture.detectChanges();
        testInputGroupType('search', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'line';
        fixture.detectChanges();
        testInputGroupType('line', igxInputGroup, inputGroupElement);

        // Set type as null, so the Token type should be used again
        igxInputGroup.type = null;
        fixture.detectChanges();
        testInputGroupType('box', igxInputGroup, inputGroupElement);
    });

    it('disabled input should properly detect changes.', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeFalsy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeTruthy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeFalsy();
    });

    it('disabled by default should properly work.', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledByDefaultComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeTruthy();
    });

    it('should handle disabled attribute without value', () => {
        pending();
        const fixture = TestBed.createComponent(InputGroupDisabledWithoutValueComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeTruthy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeFalsy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeTruthy();
    });

    it('default Display Density applied', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledByDefaultComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const inputGroupElement = inputGroup.element.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS)).toBe(true);
    });

    it('cosy Display Density applied', () => {
        const fixture = TestBed.createComponent(InputGroupCosyDisplayDensityComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const inputGroupElement = inputGroup.element.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS)).toBeFalsy();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COSY_DENSITY_CSS_CLASS)).toBeTruthy();
    });

    it('compact Display Density applied', () => {
        const fixture = TestBed.createComponent(InputGroupCompactDisplayDensityComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const inputGroupElement = inputGroup.element.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS)).toBeFalsy();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMPACT_DENSITY_CSS_CLASS)).toBeTruthy();
    });

    it('compact Display Density applied via input', () => {
        const fixture = TestBed.createComponent(InputGroupInputDisplayDensityComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const inputGroupElement = inputGroup.element.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS)).toBeFalsy();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMPACT_DENSITY_CSS_CLASS)).toBeTruthy();
    });

    it('should correctly prevent default on pointer down', () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const prefix = fixture.componentInstance.prefix;
        const input = fixture.componentInstance.igxInput;
        fixture.componentInstance.suppressInputAutofocus = false;

        const pointOnPrefix = UIInteractions.getPointFromElement(prefix.nativeElement);
        const pointerEvent = UIInteractions.createPointerEvent('pointerdown', pointOnPrefix);
        const preventDefaultSpy = spyOn(pointerEvent, 'preventDefault');

        Object.defineProperty(pointerEvent, 'target', { value: input.nativeElement });
        const inputGroupDebugElement = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

        // input group is not focused we should not prevent default on pointer down
        inputGroupDebugElement.triggerEventHandler('pointerdown', pointerEvent);
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalledTimes(0);

        Object.defineProperty(pointerEvent, 'target', { value: prefix.nativeElement });

        // input group is not focused we should not prevent default on pointer down
        inputGroupDebugElement.triggerEventHandler('pointerdown', pointerEvent);
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalledTimes(0);

        // input group is focused we should prevent default on pointer down on prefix/suffix
        inputGroup.isFocused = true;
        inputGroupDebugElement.triggerEventHandler('pointerdown', pointerEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    });

    it('should not focus input on prefix/suffix click when group is not focused and suppressInputAutofocus=true', () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const prefix = fixture.componentInstance.prefix;
        const input = fixture.componentInstance.igxInput;

        const pointerEvent = UIInteractions.getMouseEvent('click');
        Object.defineProperty(pointerEvent, 'target', { value: prefix.nativeElement });
        const inputGroupDebugElement = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

        // input group is not focused and suppressInputAutofocus is true - click on prefix/suffix should not focus the input
        fixture.componentInstance.suppressInputAutofocus = true;
        inputGroup.isFocused = false;
        fixture.detectChanges();
        inputGroupDebugElement.triggerEventHandler('click', pointerEvent);
        expect(document.activeElement).not.toEqual(input.nativeElement);

        // input group is not focused and suppressInputAutofocus is false - click on prefix/suffix should focus the input
        fixture.componentInstance.suppressInputAutofocus = false;
        inputGroup.isFocused = false;
        fixture.detectChanges();
        inputGroupDebugElement.triggerEventHandler('click', pointerEvent);
        expect(document.activeElement).toEqual(input.nativeElement);

        // input group is focused and suppressInputAutofocus is true - click on prefix/suffix should focus the input
        fixture.componentInstance.suppressInputAutofocus = true;
        inputGroup.isFocused = true;
        fixture.detectChanges();
        inputGroupDebugElement.triggerEventHandler('click', pointerEvent);
        expect(document.activeElement).toEqual(input.nativeElement);
    });
});

@Component({
    template: `<igx-input-group #igxInputGroup [suppressInputAutofocus]="suppressInputAutofocus">
                    <igx-prefix>PREFIX</igx-prefix>
                    <igx-suffix>SUFFIX</igx-suffix>
                    <input #igxInput igxInput />
                </igx-input-group>`,
     providers: [{ provide: IGX_INPUT_GROUP_TYPE, useValue: 'box'}]
})
class InputGroupComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild('igxInput', { read: IgxInputDirective, static: true }) public igxInput: IgxInputDirective;
    @ViewChild(IgxPrefixDirective, { read: ElementRef }) public prefix: ElementRef;
    @ViewChild(IgxSuffixDirective, { read: ElementRef }) public suffix: ElementRef;
    public suppressInputAutofocus = false;

    constructor(@Inject(IGX_INPUT_GROUP_TYPE) public IGTOKEN: IgxInputGroupType) {}
}

@Component({
    template: `<igx-input-group #igxInputGroup type="box">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupBoxComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="border">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupBorderComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="search">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupSearchComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
}

const testInputGroupType = (type: IgxInputGroupType, component: IgxInputGroupComponent, nativeElement: HTMLInputElement) => {
    let isLine = false;
    let isBorder = false;
    let isBox = false;
    let isSearch = false;

    switch (type) {
        case 'line':
            isLine = true;
            break;
        case 'border':
            isBorder = true;
            break;
        case 'box':
            isBox = true;
            break;
        case 'search':
            isSearch = true;
            break;
        default: break;
    }

    expect(nativeElement.classList.contains(INPUT_GROUP_BOX_CSS_CLASS)).toBe(isBox);
    expect(nativeElement.classList.contains(INPUT_GROUP_BORDER_CSS_CLASS)).toBe(isBorder);
    expect(nativeElement.classList.contains(INPUT_GROUP_SEARCH_CSS_CLASS)).toBe(isSearch);

    expect(component.isTypeLine).toBe(isLine);
    expect(component.isTypeBorder).toBe(isBorder);
    expect(component.isTypeBox).toBe(isBox);
    expect(component.isTypeSearch).toBe(isSearch);
};

@Component({
    template: `<igx-input-group #igxInputGroup [disabled]="disabled">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupDisabledComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;

    public disabled = false;

    public changeDisableState() {
        this.disabled = !this.disabled;
    }
}

@Component({
    template: `<igx-input-group #igxInputGroup disabled>
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupDisabledWithoutValueComponent {
    @ViewChild('igxInputGroup')
    public igxInputGroup: IgxInputGroupComponent;

    public changeDisableState() {
        this.igxInputGroup.disabled = !this.igxInputGroup.disabled;
    }
}

@Component({
    template: `<igx-input-group #igxInputGroup [disabled]="disabled">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupDisabledByDefaultComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;

    public disabled = true;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput />
                </igx-input-group>`,
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.cosy } }]
})
class InputGroupCosyDisplayDensityComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput />
                </igx-input-group>`,
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.compact } }]
})
class InputGroupCompactDisplayDensityComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup displayDensity="compact">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupInputDisplayDensityComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
}
