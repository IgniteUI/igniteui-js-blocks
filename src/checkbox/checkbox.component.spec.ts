import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxCheckboxComponent } from "./checkbox.component";

describe("IgxCheckbox", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCheckboxComponent,
                CheckboxSimpleComponent,
                CheckboxDisabledComponent,
                CheckboxIndeterminateComponent,
                IgxCheckboxComponent
            ],
            imports: [FormsModule, IgxRippleModule]
        })
            .compileComponents();
    }));

    it("Initializes a checkbox", () => {
        const fixture = TestBed.createComponent(InitCheckboxComponent);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const nativeLabel = fixture.debugElement.query(By.css("label")).nativeElement;
        const placeholderLabel = fixture.debugElement.query(By.css(".igx-checkbox__label")).nativeElement;

        expect(nativeCheckbox).toBeTruthy();
        expect(nativeLabel).toBeTruthy();
        expect(placeholderLabel.textContent.trim()).toEqual("Init");
    });

    it("Initialize with a ngModel", () => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const checkboxInstance = fixture.componentInstance.cb;

        const testInstance = fixture.componentInstance;

        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(false);
        expect(checkboxInstance.checked).toBe(false);

        testInstance.subscribed = true;
        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(true);
        expect(checkboxInstance.checked).toBe(true);
    });

    it("Indeterminate state", () => {
        const fixture = TestBed.createComponent(CheckboxIndeterminateComponent);
        const checkboxInstance = fixture.componentInstance;
        checkboxInstance.subscribed = true;
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(nativeCheckbox.checked).toBe(false);

        nativeCheckbox.dispatchEvent(new Event("change"));
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(false);
        expect(nativeCheckbox.checked).toBe(true);
    });

    it("Disabled state", () => {
        const fixture = TestBed.createComponent(CheckboxDisabledComponent);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const checkboxInstance = fixture.componentInstance.cb;
        const testInstance = fixture.componentInstance;

        fixture.detectChanges();

        expect(checkboxInstance.disabled).toBe(true);
        expect(nativeCheckbox.getAttribute("disabled")).toBe("true");

        nativeCheckbox.dispatchEvent(new Event("change"));
        fixture.detectChanges();

        // Should not update
        expect(checkboxInstance.checked).toBe(false);
        expect(testInstance.subscribed).toBe(false);
    });

    it("Event handling", () => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const checkboxInstance = fixture.componentInstance.cb;
        const testInstance = fixture.componentInstance;

        nativeCheckbox.dispatchEvent(new Event("focus"));
        fixture.detectChanges();

        expect(checkboxInstance.focused).toBe(true);

        nativeCheckbox.dispatchEvent(new Event("blur"));
        fixture.detectChanges();
        expect(checkboxInstance.focused).toBe(false);

        nativeCheckbox.click();
        fixture.detectChanges();

        expect(testInstance.changeEventCalled).toBe(true);
        expect(testInstance.subscribed).toBe(true);

    });
});

@Component({ template: `<igx-checkbox>Init</igx-checkbox>` })
class InitCheckboxComponent { }

@Component({
    template: `<igx-checkbox #cb (change)="onChange($event)"
[(ngModel)]="subscribed" [checked]="subscribed">Simple</igx-checkbox>`})
class CheckboxSimpleComponent {
    @ViewChild("cb") public cb: IgxCheckboxComponent;
    public changeEventCalled = false;
    public subscribed = false;
    public onChange(event) {
        this.changeEventCalled = true;
    }
}
@Component({
    template: `<igx-checkbox #cb
                                [(ngModel)]="subscribed"
                                [indeterminate]="true"
                                >Indeterminate</igx-checkbox>`})
class CheckboxIndeterminateComponent {
    @ViewChild("cb") public cb: IgxCheckboxComponent;

    public subscribed = false;
}

@Component({
    template: `<igx-checkbox #cb
                                [(ngModel)]="subscribed"
                                [checked]="subscribed"
                                [disabled]="true">Disabled</igx-checkbox>`})
class CheckboxDisabledComponent {
    @ViewChild("cb") public cb: IgxCheckboxComponent;

    public subscribed = false;
}
